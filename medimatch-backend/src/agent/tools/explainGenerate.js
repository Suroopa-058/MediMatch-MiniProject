const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CHAT_MODEL = 'openai/gpt-oss-120b'; // text-only, same as MediMatch's chat model

// ─── TOOL: explainGenerate ──────────────────────────────────────────────────
// Agent's final generation step. Two distinct modes, deliberately kept
// separate so the safety behavior is explicit rather than implicit:
//
//   MODE A — "verified": a KB match was found. The LLM's job here is ONLY
//   to rephrase the retrieved database fields into simple patient-friendly
//   language. It is explicitly instructed not to add outside facts. This
//   is the core RAG behavior — grounded generation, not open generation.
//
//   MODE B — "unverified": no KB match was found. The LLM may use its own
//   general knowledge, but the output is clearly flagged as unverified so
//   the frontend can show a visible warning banner. This prevents the
//   agent from ever silently presenting a guess as a confirmed fact.

const buildVerifiedPrompt = (medicine, extractionContext, language) => `
You are a patient education assistant. Rewrite the following VERIFIED medicine
information into simple, friendly language a patient with no medical background
can understand. Use ONLY the facts given below — do not add any information
that is not present in this data.

VERIFIED DATA (from trusted knowledge base):
Name: ${medicine.name}
Generic name: ${medicine.generic_name}
Category: ${medicine.category}
Used for: ${medicine.used_for}
Dosage info: ${medicine.dosage_info}
Precautions: ${medicine.precautions}
Side effects: ${medicine.side_effects}

${extractionContext?.frequency_instructions
  ? `Additional context from the patient's own prescription/packaging: "${extractionContext.frequency_instructions}" — mention this specific instruction if it's consistent with the verified dosage info above.`
  : ''}

Respond in ${language === 'en' ? 'English' : language} language.

Return ONLY valid JSON in this exact structure:
{
  "medicine_name": "<name with strength>",
  "used_for": "<simple 1-2 sentence explanation>",
  "how_to_take": "<simple instructions, incorporate the patient's own prescription timing if given above>",
  "important_instructions": ["<short point 1>", "<short point 2>", "..."],
  "verified": true
}`;

const buildUnverifiedPrompt = (extractedName, language) => `
You are a patient education assistant. A patient uploaded a medicine image and
the system could NOT find "${extractedName}" in its verified knowledge base.

You may use your own general medical knowledge to give a brief, cautious,
best-effort explanation — but you MUST make clear this is not verified.

Respond in ${language === 'en' ? 'English' : language} language.

Return ONLY valid JSON in this exact structure:
{
  "medicine_name": "${extractedName}",
  "used_for": "<brief best-effort explanation, or 'Unable to determine' if you don't recognize this>",
  "how_to_take": "General advice: always follow your doctor's or pharmacist's specific instructions.",
  "important_instructions": ["This medicine could not be verified against our knowledge base.", "Please confirm details with a pharmacist or doctor before use."],
  "verified": false
}`;

const explainGenerate = async ({ mode, medicine, extractedName, extractionContext, language = 'en' }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

  const prompt = mode === 'verified'
    ? buildVerifiedPrompt(medicine, extractionContext, language)
    : buildUnverifiedPrompt(extractedName, language);

  const body = {
    model: CHAT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_completion_tokens: 800,
    response_format: { type: 'json_object' },
  };

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq chat API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Groq returned empty response for explanation generation');

  let clean = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    clean = clean.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('Raw explanation text:', rawText.slice(0, 500));
    throw new Error('Failed to parse explanation JSON.');
  }
};

module.exports = { explainGenerate };