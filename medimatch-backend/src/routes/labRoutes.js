const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyLabToken } = require('../middleware/labMiddleware');
const db = require('../config/db');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'labreport-' + unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only PDF, JPG, PNG allowed'), ok);
  },
});

router.get('/search-patient', verifyLabToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, age, gender
       FROM patients
       WHERE email = ? OR phone = ?`,
      [query, query]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No patient found with that phone or email' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/upload-report', verifyLabToken, upload.single('file'), async (req, res) => {
  try {
    const { patient_id, report_type, notes } = req.body;
    const lab_id = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (!patient_id) {
      return res.status(400).json({ message: 'patient_id is required' });
    }

    const [patientCheck] = await db.query('SELECT id FROM patients WHERE id = ?', [patient_id]);
    if (patientCheck.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const file_url = `/uploads/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO lab_reports (lab_id, patient_id, report_type, file_url, notes) VALUES (?,?,?,?,?)',
      [lab_id, patient_id, report_type || 'Lab Report', file_url, notes || null]
    );

    res.status(201).json({
      message: '✅ Report uploaded and linked to patient!',
      id: result.insertId,
      file_url,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/lab/patient-reports ────────────────────────────────────────
// Patient-facing — uses the PATIENT's own token (not lab token) to fetch
// reports labs have uploaded for them. Needs a separate import since this
// file otherwise only uses verifyLabToken.
router.get('/patient-reports', require('../middleware/authMiddleware').verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT lr.*, l.name as lab_name
       FROM lab_reports lr
       JOIN labs l ON lr.lab_id = l.id
       WHERE lr.patient_id = ?
       ORDER BY lr.uploaded_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;