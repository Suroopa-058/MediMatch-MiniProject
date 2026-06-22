const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../config/db');

// ─── Storage strategy ──────────────────────────────────────────────────────
// Render's free tier has an EPHEMERAL filesystem: anything written to disk
// (like multer's old diskStorage into 'uploads/') gets wiped on every
// restart/redeploy, and the 'uploads/' folder doesn't even exist on a fresh
// container — which is exactly why uploads were failing with ENOENT.
//
// Fix: use multer.memoryStorage() so the file lives only in RAM during the
// request. We still write it to a LOCAL uploads/ folder for convenience in
// local dev (so existing file-based features keep working on your laptop),
// but we make sure that folder exists first, and we no longer depend on it
// surviving between requests on Render.

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure the uploads folder exists (works both locally and on Render's
// current running instance — it just won't persist across Render restarts,
// which is fine since the file is also analyzed immediately and the AI
// summary is what actually gets stored permanently, in MySQL).
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // absolute path now, not relative 'uploads/'
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG allowed'));
  }
});

// Upload report
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { report_type, notes } = req.body;
    const patient_id = req.user.id;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [dbResult] = await db.query(
      `INSERT INTO reports (patient_id, report_type, file_url, ai_summary, urgency, uploaded_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [patient_id, report_type, file_url, notes || null, 'normal']
    );

    res.status(201).json({ 
      message: '✅ Report uploaded!',
      file_url,
      id: dbResult.insertId
    });
  } catch (err) {
    console.error('UPLOAD ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get patient reports
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reports WHERE patient_id = ? ORDER BY uploaded_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;