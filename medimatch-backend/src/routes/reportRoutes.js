const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../config/db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

    // ✅ capture insertId
    const [dbResult] = await db.query(
      `INSERT INTO reports (patient_id, report_type, file_url, ai_summary, urgency, uploaded_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [patient_id, report_type, file_url, notes || null, 'normal']
    );

    res.status(201).json({ 
      message: '✅ Report uploaded!',
      file_url,
      id: dbResult.insertId   // ✅ return the ID
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