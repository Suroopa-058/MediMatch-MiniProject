const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: '✅ Login successful!', token, admin: { id: admin.id, full_name: admin.full_name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Not admin' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [[{ totalPatients }]] = await db.query('SELECT COUNT(*) as totalPatients FROM patients');
    const [[{ totalDoctors }]] = await db.query('SELECT COUNT(*) as totalDoctors FROM doctors');
    const [[{ pendingDoctors }]] = await db.query('SELECT COUNT(*) as pendingDoctors FROM doctors WHERE is_verified = 0 OR is_verified IS NULL');
    const [[{ totalAppointments }]] = await db.query('SELECT COUNT(*) as totalAppointments FROM appointments');
    res.json({ totalPatients, totalDoctors, pendingDoctors, totalAppointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all doctors
router.get('/doctors', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, full_name, email, phone, specialization, hospital, license_no, is_verified, created_at FROM doctors ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify doctor
router.put('/doctors/:id/verify', verifyAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    const value = action === 'approve' ? 1 : -1;
    await db.query('UPDATE doctors SET is_verified = ? WHERE id = ?', [value, req.params.id]);
    res.json({ message: `Doctor ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all patients
router.get('/patients', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, full_name, email, phone, age, gender, blood_group, created_at FROM patients ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all appointments
router.get('/appointments', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, p.full_name as patient_name, d.full_name as doctor_name, d.specialization
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;