const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Chat route
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `You are MediMatch AI Health Assistant. Help patients with:
1. Understanding symptoms
2. Explaining medical reports simply
3. Recommending which specialist to consult
4. General health tips
Always be empathetic. Remind users to consult real doctors.
Support multiple languages — reply in the same language the user writes in!`,
        messages: messages
      })
    });

    const data = await response.json();
    res.json({ reply: data.content?.[0]?.text || 'Sorry, try again!' });

  } catch (err) {
    console.error('CHAT ERROR:', err.message);
    res.status(500).json({ reply: 'Server error! Try again.' });
  }
});

// Real report analysis using Claude Vision
router.post('/analyze-report', async (req, res) => {
  try {
    const { reportId, filePath, reportType } = req.body;

    console.log('Analyzing report:', { reportId, filePath, reportType });

    // Read image and convert to base64
    const absolutePath = path.join(__dirname, '../../', filePath);
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mediaType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: `You are a medical report analyzer. Analyze the given medical report image and return ONLY a valid JSON object with no extra text, no markdown, no backticks. The JSON must follow this exact structure:
{
  "summary": "2-3 sentence plain English summary",
  "urgency": "normal",
  "urgencyReason": "short reason why this urgency level",
  "findings": [
    {
      "name": "Test name",
      "value": "measured value with unit",
      "normal": "normal range with unit",
      "status": "normal",
      "severity": "normal",
      "desc": "one line plain English explanation"
    }
  ],
  "specialists": [
    {
      "type": "specialist type e.g. Cardiologist",
      "reason": "why this specialist is recommended"
    }
  ],
  "confidenceScore": 90
}
Rules:
- urgency must be one of: normal, mild, moderate, critical
- status must be one of: normal, high, low
- severity must be one of: normal, mild, moderate, critical
- confidenceScore must be a number between 0 and 100
- Return ONLY the JSON, nothing else`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: `Analyze this ${reportType} medical report and return only the JSON.`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Claude response:', data.type, data.error || 'OK');

    if (data.error) {
      return res.status(500).json({ message: 'Claude API error', error: data.error.message });
    }

    const text = data.content?.[0]?.text || '{}';
    console.log('Raw Claude text:', text);

    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    // Save to DB
    const db = require('../config/db');
    await db.query(
      'UPDATE reports SET ai_summary = ?, urgency = ? WHERE id = ?',
      [result.summary, result.urgency, reportId]
    );

    res.json(result);

  } catch (err) {
    console.error('ANALYZE ERROR:', err.message);
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
});

module.exports = router;