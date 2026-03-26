const db = require('../config/db');

const createAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason, fee } = req.body;
    const patient_id = req.user.id;

    const [result] = await db.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, fee) VALUES (?,?,?,?,?,?)',
      [patient_id, doctor_id, appointment_date, appointment_time, reason, fee]
    );

    res.status(201).json({ message: '✅ Appointment booked!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctor_id = req.user.id;
    const [rows] = await db.query(
      `SELECT a.*, p.full_name as patient_name, p.age, p.gender, p.phone
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date, a.appointment_time`,
      [doctor_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `✅ Appointment ${status}!` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const patient_id = req.user.id;
    const [rows] = await db.query(
      `SELECT a.*, d.full_name as doctor_name, d.specialization, d.hospital
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC`,
      [patient_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ NEW: Verify OTP and mark appointment
const verifyOTP = async (req, res) => {
  try {
    const { appointment_id, otp } = req.body;

    if (otp !== '1234') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await db.query(
      'UPDATE appointments SET otp_verified = TRUE WHERE id = ?',
      [appointment_id]
    );

    res.json({ message: '✅ OTP verified!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ NEW: Save prescription
// ✅ Save prescription — auto-fetches patient_id from appointment
const savePrescription = async (req, res) => {
  try {
    const { appointment_id, diagnosis, notes, medications } = req.body;
    const doctor_id = req.user.id;

    let patient_id;

    if (appointment_id) {
      // Get patient_id from appointment
      const [appt] = await db.query(
        'SELECT patient_id FROM appointments WHERE id = ?',
        [appointment_id]
      );
      if (!appt.length) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      patient_id = appt[0].patient_id;
    } else {
      // No appointment — get first patient of this doctor
      const [appt] = await db.query(
        `SELECT patient_id FROM appointments 
         WHERE doctor_id = ? ORDER BY id DESC LIMIT 1`,
        [doctor_id]
      );
      if (!appt.length) {
        return res.status(404).json({ message: 'No patients found for this doctor' });
      }
      patient_id = appt[0].patient_id;
    }

    const [result] = await db.query(
      `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, notes, medications)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [appointment_id || null, patient_id, doctor_id, diagnosis, notes, JSON.stringify(medications)]
    );

    await db.query(
      'UPDATE appointments SET prescription_sent = TRUE, status = ? WHERE id = ?',
      ['completed', appointment_id]
    );

    res.status(201).json({ message: '✅ Prescription sent!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// ✅ NEW: Get prescription for patient
const getPatientPrescription = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const [rows] = await db.query(
      `SELECT p.*, d.full_name as doctor_name, d.specialization, d.hospital
       FROM prescriptions p
       JOIN doctors d ON p.doctor_id = d.id
       WHERE p.appointment_id = ?`,
      [appointment_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No prescription found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
  verifyOTP,
  savePrescription,
  getPatientPrescription
};