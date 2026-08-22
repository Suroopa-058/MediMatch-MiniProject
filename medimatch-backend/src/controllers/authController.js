const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/sendEmail');

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

// ── PATIENT REGISTER ──
const patientRegister = async (req, res) => {
  try {
    const { full_name, email, phone, password, age, gender, blood_group } = req.body;

    const [existing] = await db.query('SELECT id FROM patients WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await db.query(
      'INSERT INTO patients (full_name, email, phone, password, age, gender, blood_group, email_verified, otp_code, otp_expires_at) VALUES (?,?,?,?,?,?,?,0,?,?)',
      [full_name, email, phone, hashed, age, gender, blood_group, otp, otpExpires]
    );

    try {
      await sendOTPEmail(email, full_name, otp);
    } catch (mailErr) {
      console.error('OTP email failed:', mailErr.message);
    }

    res.status(201).json({
      message: '✅ Registered! Please verify your email with the OTP we sent.',
      email,
      role: 'patient',
    });
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

    if (!patient.email_verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: patient.email,
        role: 'patient',
      });
    }

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
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      'INSERT INTO doctors (full_name, email, phone, password, specialization, experience, consult_fee, hospital, license_no, languages, email_verified, otp_code, otp_expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?)',
      [full_name, email, phone, hashed, specialization, experience, consult_fee, hospital, license_no, languages, otp, otpExpires]
    );

    try {
      await sendOTPEmail(email, full_name, otp);
    } catch (mailErr) {
      console.error('OTP email failed:', mailErr.message);
    }

    res.status(201).json({
      message: '✅ Registered! Please verify your email, then wait for admin approval.',
      email,
      role: 'doctor',
    });
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

    if (!doctor.email_verified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: doctor.email,
        role: 'doctor',
      });
    }

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

// ── SEND / RESEND OTP ──
const sendOtp = async (req, res) => {
  try {
    const { email, role } = req.body;
    const table = role === 'doctor' ? 'doctors' : 'patients';

    const [rows] = await db.query(`SELECT id, full_name, email_verified FROM ${table} WHERE email = ?`, [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Account not found' });

    const user = rows[0];
    if (user.email_verified)
      return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(`UPDATE ${table} SET otp_code = ?, otp_expires_at = ? WHERE id = ?`, [otp, otpExpires, user.id]);
    await sendOTPEmail(email, user.full_name, otp);

    res.json({ message: '✅ OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── VERIFY OTP ──
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    const table = role === 'doctor' ? 'doctors' : 'patients';

    const [rows] = await db.query(`SELECT id, otp_code, otp_expires_at, email_verified FROM ${table} WHERE email = ?`, [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Account not found' });

    const user = rows[0];
    if (user.email_verified)
      return res.status(400).json({ message: 'Email already verified' });

    if (!user.otp_code || user.otp_code !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

    if (new Date() > new Date(user.otp_expires_at))
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    await db.query(`UPDATE ${table} SET email_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE id = ?`, [user.id]);

    res.json({ message: '✅ Email verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { patientRegister, patientLogin, doctorRegister, doctorLogin, sendOtp, verifyOtp };