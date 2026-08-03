const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware'); // MediMatch's existing auth
const { runMedicineAgent } = require('../agent/agentOrchestrator');
const db = require('../config/db');

// Same ephemeral-filesystem-aware upload pattern already used by
// MediMatch's reportRoutes.js — kept consistent with the rest of the app.
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'scan-' + unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpg|jpeg|png/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only JPG/PNG allowed'), ok);
  },
});

// ─── POST /api/scan/analyze ─────────────────────────────────────────────────
// req.user.id comes from MediMatch's existing JWT — same token a patient
// already gets from /api/auth/patient/login. No separate login needed.
router.post('/analyze', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const patientId = req.user.id;
    const language = req.body.language || 'en';
    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    const result = await runMedicineAgent({
      imagePath,
      imageUrl,
      userId: patientId, // orchestrator param name unchanged — now holds a patients.id
      language,
    });

    res.status(result.success ? 200 : 422).json(result);
  } catch (err) {
    console.error('AGENT ERROR:', err.message);
    res.status(500).json({ message: 'Agent pipeline failed', error: err.message });
  }
});

// ─── GET /api/scan/history ────────────────────────────────────────────────
router.get('/history', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM scan_history WHERE user_id = ? ORDER BY scanned_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/scan/:id ────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM scan_history WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Scan not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;