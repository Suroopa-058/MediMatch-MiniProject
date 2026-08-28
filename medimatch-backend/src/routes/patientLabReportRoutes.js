const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../config/db');

// ─── GET /api/patient-lab-reports/my ─────────────────────────────────────────
// Patient-facing — uses the PATIENT's own token (not a lab token), so a
// patient can only ever see reports linked to their own id.
router.get('/my', verifyToken, async (req, res) => {
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