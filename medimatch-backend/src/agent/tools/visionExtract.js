const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'qwen/qwen3.6-27b'; // same model you're already using in MediMatch

// ─── TOOL: visionExtract ───────────────────────────────────────────────────
// Agent's first tool call. Takes an image (tablet strip OR prescription),
// returns structured extraction — NOT the final explanation. Keeping this
// tool narrowly scoped (extraction only) is what lets the orchestrator
// make a decision afterward (proceed vs. ask for a clearer image) instead
// of the vision call doing everything blindly in one shot.

const EXTRACTION_PROMPT = `You are a medicine identification assistant analyzing an image that is either:
(a) a medicine tablet/strip package, or
(b) a doctor's handwritten or printed prescription.

Extract what you can see. Return ONLY valid JSON, nothing else:

{
  "image_type": "tablet_strip" | "prescription" | "unclear",
  "medicines_detected": [
    {
      "raw_text": "<exact text as it appears on packaging/prescription>",
      "likely_name": "<your best guess at the actual medicine name, cleaned up>",
      "strength": "<e.g. 500mg, if visible>",
      "frequency_instructions": "<any dosage/frequency text visible, e.g. '1-0-1 after food', or null if none visible>"
    }
  ],
  "confidence": <integer 0-100, your confidence in the extraction accuracy>,
  "image_quality_issue": "<describe if blurry/dark/cut-off/handwriting illegible, or null if image is clear>"
}

Rules:
- If handwriting is illegible, still return your best guess but set confidence low and describe the issue.
- If multiple medicines appear (common in prescriptions), list all of them.
- Do not invent a medicine name if nothing is legible — use "unclear" and confidence 0 instead.
- Return ONLY the JSON object.`;

const getMimeType = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  const map = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
  return map[ext] || 'image/jpeg';
};

const visionExtract = async (absolutePath) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

  const mimeType = getMimeType(absolutePath);
  const fileBuffer = fs.readFileSync(absolutePath);
  const base64Data = fileBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const body = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACTION_PROMPT },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.1,
    max_completion_tokens:500,
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
    throw new Error(`Groq vision API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Groq returned empty response for vision extraction');

  let clean = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    clean = clean.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('Raw vision extraction text:', rawText.slice(0, 500));
    throw new Error('Failed to parse vision extraction JSON. Image may be too unclear.');
  }
};

module.exports = { visionExtract };