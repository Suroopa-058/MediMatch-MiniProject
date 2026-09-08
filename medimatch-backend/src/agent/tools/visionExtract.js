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

const EXTRACTION_PROMPT = `
Analyze this image. It may contain a medicine tablet strip/package or a prescription.

You MUST return a valid JSON object.

IMPORTANT:
- Do not include <think> tags.
- Do not explain your reasoning.
- Do not include markdown.
- Do not write any text before or after the JSON.
- Return exactly one JSON object.
- Use double quotes for all JSON keys and string values.
- If the medicine cannot be identified, use "unclear".
- If text cannot be read, use an empty string "".
- Do not invent a medicine name.

Return JSON in exactly this format:

{
  "image_type": "tablet_strip",
  "medicines_detected": [
    {
      "raw_text": "",
      "likely_name": "",
      "strength": "",
      "frequency_instructions": null
    }
  ],
  "confidence": 0,
  "image_quality_issue": null
}

Allowed image_type values:
- "tablet_strip"
- "prescription"
- "unclear"

If no medicine is detected, return:

{
  "image_type": "unclear",
  "medicines_detected": [],
  "confidence": 0,
  "image_quality_issue": "Image is unclear or no medicine information is visible"
}
`;

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
        {
          type: 'text',
          text: EXTRACTION_PROMPT,
        },
        {
          type: 'image_url',
          image_url: { url: dataUrl },
        },
      ],
    },
  ],
  temperature: 0.1,
max_completion_tokens: 900,
response_format: {
  type: 'json_object',
},
reasoning_effort: 'none',
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
  console.log('RAW VISION RESPONSE:', rawText);
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
  console.error('Raw vision extraction text:', rawText.slice(0, 1000));
  console.error('JSON parsing error:', e.message);

  throw new Error(
    'Vision AI did not return the expected JSON format. Please try again.'
  );
}
};

module.exports = { visionExtract };