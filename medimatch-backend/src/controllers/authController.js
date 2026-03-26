const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── PATIENT REGISTER ──
const patientRegister = async (req, res) => {
  try {
    const { full_name, email, phone, password, age, gender, blood_group } = req.body;

    // Check if email exists
    const [existing] = await db.query('SELECT id FROM patients WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert patient
    await db.query(
      'INSERT INTO patients (full_name, email, phone, password, age, gender, blood_group) VALUES (?,?,?,?,?,?,?)',
      [full_name, email, phone, hashed, age, gender, blood_group]
    );

    res.status(201).json({ message: '✅ Patient registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATIENT LOGIN ──
const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM patients WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Patient not found' });

    const patient = rows[0];
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: patient.id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      patient: {
        id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        blood_group: patient.blood_group,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DOCTOR REGISTER ──
const doctorRegister = async (req, res) => {
  try {
    const { full_name, email, phone, password, specialization, experience, consult_fee, hospital, license_no, languages } = req.body;

    const [existing] = await db.query('SELECT id FROM doctors WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO doctors (full_name, email, phone, password, specialization, experience, consult_fee, hospital, license_no, languages) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [full_name, email, phone, hashed, specialization, experience, consult_fee, hospital, license_no, languages]
    );

    res.status(201).json({ message: '✅ Doctor registered! Pending admin verification.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DOCTOR LOGIN ──
const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Doctor not found' });

    const doctor = rows[0];
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: doctor.id, role: 'doctor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      doctor: {
        id: doctor.id,
        full_name: doctor.full_name,
        email: doctor.email,
        specialization: doctor.specialization,
        hospital: doctor.hospital,
        rating: doctor.rating,
        is_verified: doctor.is_verified,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { patientRegister, patientLogin, doctorRegister, doctorLogin };