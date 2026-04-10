const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const analyzeWithGemini = async (base64Image, mediaType, reportType) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = `Analyze this ${reportType} medical report image and return ONLY a valid JSON object:
{
  "summary": "2-3 sentence plain English summary",
  "urgency": "normal",
  "urgencyReason": "short reason",
  "findings": [
    {
      "name": "Test name",
      "value": "actual value with unit",
      "normal": "normal range",
      "status": "normal",
      "severity": "normal",
      "desc": "one line explanation"
    }
  ],
  "specialists": [
    { "type": "specialist type", "reason": "why" }
  ],
  "confidenceScore": 90
}
Rules: urgency must be normal/mild/moderate/critical, status must be normal/high/low, severity must be normal/mild/moderate/critical. Extract ACTUAL values. Return ONLY JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mediaType,
                data: base64Image
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    const text = response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    console.log('✅ Gemini analysis success');
    return result;

  } catch (err) {
    console.error('Gemini error:', err.message);
    return null;
  }
};

// Chat route
router.post('/chat', async (req, res) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const { messages } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [{
        parts: [{
          text: `You are MediMatch AI Health Assistant. Help patients understand symptoms, medical reports, and recommend specialists. Be empathetic. Always remind users to consult real doctors.\n\nUser: ${userMessage}`
        }]
      }]
    });

    const reply = response.text() || 'Sorry, try again!';
    res.json({ reply });
  } catch (err) {
    console.error('CHAT ERROR:', err.message);
    res.status(500).json({ reply: 'Server error! Try again.' });
  }
});

// Report analysis route
router.post('/analyze-report', async (req, res) => {
  try {
    const { reportId, filePath, reportType } = req.body;
    console.log('Analyzing report:', { reportId, filePath, reportType });

    const absolutePath = path.join(__dirname, '../../', filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }

    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mediaType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

    let result = await analyzeWithGemini(base64Image, mediaType, reportType || 'Medical');

    if (!result) {
      result = {
        summary: 'AI analysis temporarily unavailable. Please try again later.',
        urgency: 'normal',
        urgencyReason: 'Could not analyze automatically',
        findings: [],
        specialists: [{ type: 'General Physician', reason: 'Please consult a doctor for manual review' }],
        confidenceScore: 0
      };
    }

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