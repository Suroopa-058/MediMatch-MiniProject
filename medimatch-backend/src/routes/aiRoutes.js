const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'qwen/qwen3.6-27b'; // handles image + JSON mode — replaces deprecated llama-4-scout// handles image + JSON mode
const CHAT_MODEL = 'openai/gpt-oss-120b'; // text-only chatbot

// ─── Groq Vision Analysis ─────────────────────────────────────────────────────

const analyzeWithGroq = async (absolutePath, mimeType) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

  const fileBuffer = fs.readFileSync(absolutePath);
  const base64Data = fileBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const prompt = `You are an expert medical report analysis AI. Read every value from this medical report.

Return ONLY a valid JSON object. Keep descriptions short (under 20 words each) to fit in the response.

{
  "summary": "<max 100 words, plain English>",
  "urgency": "normal",
  "urgencyReason": "<one short sentence>",
  "findings": [
    {
      "name": "<test name>",
      "value": "<value with unit>",
      "normal": "<range>",
      "status": "normal",
      "severity": "normal",
      "desc": "<under 15 words>"
    }
  ],
  "specialists": [
    { "type": "<specialist>", "reason": "<short reason>" }
  ],
  "confidenceScore": 85
}

urgency must be one of: normal, mild, moderate, critical
status must be one of: normal, high, low
severity must be one of: normal, mild, moderate, critical

Extract every test. Keep all text fields SHORT. Return ONLY the JSON, nothing else.`;

  const body = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.1,
    max_completion_tokens:900,
    response_format: { type: 'json_object' },
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
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Groq returned empty response');

  // Clean markdown fences (in case the model adds them despite json_object mode)
  let clean = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Extract just the JSON object if there's extra text
  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    clean = clean.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error('Raw Groq text:', rawText.slice(0, 500));
    throw new Error('Failed to parse Groq JSON response. Try uploading a clearer image.');
  }
};

// ─── Detect MIME type ─────────────────────────────────────────────────────────

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return map[ext] || 'image/jpeg';
};

// ─── Rule-based specialist mapping ───────────────────────────────────────────

const applySpecialistRules = (findings) => {
  const specialists = new Map();
  for (const f of findings) {
    if (f.status === 'normal') continue;
    const name = f.name.toLowerCase();
    if (name.includes('glucose') || name.includes('hba1c'))
      specialists.set('Endocrinologist', `Elevated ${f.name} (${f.value}) suggests diabetes risk.`);
    if (name.includes('cholesterol') || name.includes('ldl') || name.includes('triglyceride'))
      specialists.set('Cardiologist', `High ${f.name} (${f.value}) increases cardiovascular risk.`);
    if (name.includes('creatinine') || name.includes('bun') || name.includes('urea'))
      specialists.set('Nephrologist', `Abnormal ${f.name} (${f.value}) may indicate kidney concerns.`);
    if (name.includes('alt') || name.includes('ast') || name.includes('sgpt') || name.includes('sgot') || name.includes('bilirubin'))
      specialists.set('Hepatologist', `Abnormal ${f.name} (${f.value}) indicates liver stress.`);
    if (name.includes('tsh') || name.includes('thyroid') || name.includes(' t3') || name.includes(' t4'))
      specialists.set('Endocrinologist', `Abnormal ${f.name} (${f.value}) suggests thyroid dysfunction.`);
    if (name.includes('hemoglobin') || name.includes('hgb') || name.includes('rbc'))
      specialists.set('Hematologist', `Abnormal ${f.name} (${f.value}) requires blood specialist review.`);
    if (name.includes('uric acid'))
      specialists.set('Rheumatologist', `Abnormal uric acid (${f.value}) may indicate gout risk.`);
    if (name.includes('wbc') || name.includes('white blood'))
      specialists.set('General Physician', `Abnormal ${f.name} (${f.value}) may indicate infection.`);
  }
  if (specialists.size === 0) {
    const abnormal = findings.filter((f) => f.status !== 'normal');
    if (abnormal.length > 0)
      specialists.set('General Physician', 'Some values outside normal range. General checkup recommended.');
  }
  return Array.from(specialists.entries()).map(([type, reason]) => ({ type, reason }));
};

// ─── POST /api/ai/analyze-report ─────────────────────────────────────────────

router.post('/analyze-report', async (req, res) => {
  try {
    const { reportId, filePath, reportType } = req.body;
    console.log('Analyzing report:', { reportId, filePath, reportType });

    const absolutePath = path.join(__dirname, '../../', filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Report file not found on server.' });
    }

    const mimeType = getMimeType(absolutePath);
    let result = await analyzeWithGroq(absolutePath, mimeType);

    // Apply rule-based specialists
    const ruleSpecialists = applySpecialistRules(result.findings || []);
    if (ruleSpecialists.length > 0) result.specialists = ruleSpecialists;

    // Clamp confidence
    result.confidenceScore = Math.max(0, Math.min(100, Math.round(result.confidenceScore || 80)));

    // Save to DB
    const db = require('../config/db');
    await db.query(
      'UPDATE reports SET ai_summary = ?, urgency = ? WHERE id = ?',
      [result.summary, result.urgency, reportId]
    );

    console.log('Analysis complete. Urgency:', result.urgency, '| Findings:', result.findings?.length);
    res.json(result);
  } catch (err) {
    console.error('ANALYZE ERROR:', err.message);
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
});

// ─── POST /api/ai/chat — general health Q&A chatbot (text only, no file) ────

const SYSTEM_PROMPT = `You are MediMatch AI Health Assistant. You help patients with:
1. Understanding symptoms and possible conditions
2. Explaining medical report values in simple language
3. Recommending which type of specialist to consult
4. General health tips and advice
5. Explaining medical terms simply

Always:
- Be empathetic and caring
- Give simple easy to understand answers
- Recommend seeing a real doctor for serious issues
- Keep responses concise and helpful (under 120 words)
- Use emojis to make responses friendly
- If symptoms sound critical, clearly say "Please see a doctor immediately!"

You are NOT a replacement for real doctors. Always remind users to consult real doctors for diagnosis.`;

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: 'user'|'assistant', text: '...' }, ...]

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

    // Groq/OpenAI format expects roles "system", "user", "assistant"
    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
        .filter((m) => m.text && m.text.trim())
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
    ];

    const body = {
      model: CHAT_MODEL,
      messages: chatMessages,
      temperature: 0.4,
      max_completion_tokens: 512,
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
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) throw new Error('Groq returned an empty response');

    res.json({ reply });
  } catch (err) {
    console.error('CHAT ERROR:', err.message);
    res.status(500).json({ error: 'Failed to get AI response', details: err.message });
  }
});

module.exports = router;