const { visionExtract } = require('./tools/visionExtract');
const { searchMedicine } = require('./tools/kbSearch');
const { explainGenerate } = require('./tools/explainGenerate');
const db = require('../config/db');

// ─── AGENT ORCHESTRATOR ──────────────────────────────────────────────────────
// This is the decision-making core. It is NOT a straight-line script —
// at each stage it inspects the previous tool's output and decides what
// to do next. That branching is what distinguishes an "agent" from a
// single prompt call:
//
//   Step 1 (EXTRACT) → confidence check → possibly stop early
//   Step 2 (RETRIEVE) → match check → choose which generation mode to use
//   Step 3 (GENERATE) → grounded or flagged-unverified output
//   Step 4 (ACT) → persist result to history
//
// Every branch is logged in the returned `agentTrace` so the frontend
// (and you, in an interview/demo) can show exactly what decisions the
// agent made and why — this trace is genuinely useful to have, not just
// decoration, since it's the clearest way to prove this is agentic
// behavior rather than a single LLM call.

const CONFIDENCE_THRESHOLD = 40; // below this, don't bother calling the KB/LLM — ask for a better photo

const runMedicineAgent = async ({ imagePath, imageUrl, userId, language = 'en' }) => {
  const agentTrace = [];

  // ── Step 1: EXTRACT ──────────────────────────────────────────────────
  agentTrace.push({ step: 'extract', status: 'started' });
  const extraction = await visionExtract(imagePath);
  agentTrace.push({
    step: 'extract',
    status: 'completed',
    result: {
      image_type: extraction.image_type,
      confidence: extraction.confidence,
      medicines_found: extraction.medicines_detected?.length || 0,
    },
  });

  // Decision point 1: is the extraction usable at all?
  if (
    extraction.image_type === 'unclear' ||
    !extraction.medicines_detected ||
    extraction.medicines_detected.length === 0 ||
    extraction.confidence < CONFIDENCE_THRESHOLD
  ) {
    agentTrace.push({
      step: 'decision',
      choice: 'stop_early_low_confidence',
      reason: extraction.image_quality_issue || 'Confidence too low to proceed reliably',
    });

    return {
      success: false,
      needsBetterImage: true,
      message: extraction.image_quality_issue
        ? `We couldn't read this clearly: ${extraction.image_quality_issue}. Please try a clearer, well-lit photo.`
        : 'We could not confidently identify a medicine in this image. Please try a clearer photo.',
      agentTrace,
    };
  }

  // For MVP: process the first/primary medicine detected.
  // (Multi-medicine prescriptions are a natural Phase 3 extension —
  // loop this same block per detected medicine.)
  const primaryDetection = extraction.medicines_detected[0];

  // ── Step 2: RETRIEVE (RAG) ───────────────────────────────────────────
  agentTrace.push({ step: 'retrieve', status: 'started', query: primaryDetection.likely_name });
  const retrieval = await searchMedicine(primaryDetection.likely_name);
  agentTrace.push({
    step: 'retrieve',
    status: 'completed',
    result: { matched: retrieval.matched, method: retrieval.matchMethod },
  });

  // Decision point 2: was there a verified match?
  let explanation;
  if (retrieval.matched) {
    agentTrace.push({ step: 'decision', choice: 'use_verified_generation', reason: 'KB match found' });
    explanation = await explainGenerate({
      mode: 'verified',
      medicine: retrieval.medicine,
      extractionContext: primaryDetection,
      language,
    });
  } else {
    agentTrace.push({ step: 'decision', choice: 'use_unverified_fallback', reason: 'No KB match found' });
    explanation = await explainGenerate({
      mode: 'unverified',
      extractedName: primaryDetection.likely_name,
      language,
    });
  }
  agentTrace.push({ step: 'generate', status: 'completed', verified: explanation.verified });

  // ── Step 3: ACT — persist to history ─────────────────────────────────
  agentTrace.push({ step: 'act', status: 'started', action: 'save_to_history' });
  const [dbResult] = await db.query(
    `INSERT INTO scan_history
       (user_id, image_url, extracted_text, matched_medicine_id, ai_explanation, confidence_score, scanned_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      imageUrl,
      primaryDetection.raw_text || primaryDetection.likely_name,
      retrieval.matched ? retrieval.medicine.id : null,
      JSON.stringify(explanation),
      extraction.confidence,
    ]
  );
  agentTrace.push({ step: 'act', status: 'completed', scanId: dbResult.insertId });

  return {
    success: true,
    scanId: dbResult.insertId,
    explanation,
    extraction: {
      image_type: extraction.image_type,
      confidence: extraction.confidence,
    },
    alternativeMatches: retrieval.alternativeMatches?.map((m) => m.name) || [],
    agentTrace,
  };
};

module.exports = { runMedicineAgent };