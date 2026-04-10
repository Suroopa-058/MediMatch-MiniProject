const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/patient', verifyToken, async (req, res) => {
  try {
    const id = req.user.id;

    const [[{ reports }]] = await db.query(
      'SELECT COUNT(*) as reports FROM reports WHERE patient_id = ?', [id]);

    const [[{ reportsThisWeek }]] = await db.query(
      `SELECT COUNT(*) as reportsThisWeek FROM reports 
       WHERE patient_id = ? AND uploaded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`, [id]);

    const [[{ appointments }]] = await db.query(
      `SELECT COUNT(*) as appointments FROM appointments 
       WHERE patient_id = ? AND status IN ('pending','confirmed') 
       AND appointment_date >= CURDATE()`, [id]);

    const [[nextAppt]] = await db.query(
      `SELECT appointment_date FROM appointments 
       WHERE patient_id = ? AND status IN ('pending','confirmed') 
       AND appointment_date >= CURDATE()
       ORDER BY appointment_date ASC LIMIT 1`, [id]);

    const [upcoming] = await db.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, 
              a.status, a.reason,
              d.full_name as doctor_name, d.specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ? AND a.status IN ('pending','confirmed')
       AND a.appointment_date >= CURDATE()
       ORDER BY a.appointment_date ASC LIMIT 3`, [id]);

    const [recentReports] = await db.query(
      `SELECT id, report_type, urgency, uploaded_at 
       FROM reports WHERE patient_id = ? 
       ORDER BY uploaded_at DESC LIMIT 3`, [id]);

    res.json({ reports, reportsThisWeek, appointments,
      nextAppt: nextAppt?.appointment_date || null,
      upcoming, recentReports });

  } catch (err) {
    console.error('Patient stats error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.get('/doctor', verifyToken, async (req, res) => {
  try {
    const id = req.user.id;

    const [[{ todayAppts }]] = await db.query(
      `SELECT COUNT(*) as todayAppts FROM appointments 
       WHERE doctor_id = ? AND appointment_date = CURDATE()`, [id]);

    const [[{ pending }]] = await db.query(
      `SELECT COUNT(*) as pending FROM appointments 
       WHERE doctor_id = ? AND status = 'pending'`, [id]);

    const [[{ totalPatients }]] = await db.query(
      `SELECT COUNT(DISTINCT patient_id) as totalPatients 
       FROM appointments WHERE doctor_id = ?`, [id]);

    const [[{ reportsToReview }]] = await db.query(
      `SELECT COUNT(*) as reportsToReview FROM reports r
       WHERE r.patient_id IN (
         SELECT DISTINCT patient_id FROM appointments WHERE doctor_id = ?
       ) AND r.urgency IN ('critical','moderate')`, [id]);

    const [todayList] = await db.query(
      `SELECT a.id, a.appointment_time, a.status, a.reason,
              p.full_name as patient_name, p.gender
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
       ORDER BY a.appointment_time ASC LIMIT 5`, [id]);

    const [recentReports] = await db.query(
      `SELECT r.id, r.report_type, r.urgency, r.uploaded_at,
              p.full_name as patient_name
       FROM reports r
       JOIN patients p ON r.patient_id = p.id
       WHERE r.patient_id IN (
         SELECT DISTINCT patient_id FROM appointments WHERE doctor_id = ?
       )
       ORDER BY r.uploaded_at DESC LIMIT 3`, [id]);

    res.json({ todayAppts, pending, totalPatients, reportsToReview, todayList, recentReports });

  } catch (err) {
    console.error('Doctor stats error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Health Dashboard — full patient data
router.get('/health-dashboard', verifyToken, async (req, res) => {
  try {
    const id = req.user.id;

    // Reports count + urgency breakdown
    const [[{ totalReports }]] = await db.query(
      'SELECT COUNT(*) as totalReports FROM reports WHERE patient_id = ?', [id]);

    const [urgencyCounts] = await db.query(
      `SELECT urgency, COUNT(*) as count FROM reports 
       WHERE patient_id = ? GROUP BY urgency`, [id]);

    // Total visits (completed appointments)
    const [[{ totalVisits }]] = await db.query(
      `SELECT COUNT(*) as totalVisits FROM appointments 
       WHERE patient_id = ? AND status = 'completed'`, [id]);

    // Active prescriptions count
    const [[{ activeRx }]] = await db.query(
      `SELECT COUNT(*) as activeRx FROM prescriptions 
       WHERE patient_id = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`, [id]);

    // All prescriptions with doctor info
    const [prescriptions] = await db.query(
      `SELECT p.*, d.full_name as doctor_name, d.specialization
       FROM prescriptions p
       JOIN doctors d ON p.doctor_id = d.id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC`, [id]);

    // Medical history timeline
    const [appointments] = await db.query(
      `SELECT a.id, a.appointment_date, a.reason, a.status,
              d.full_name as doctor_name, d.specialization
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC LIMIT 10`, [id]);

    const [reports] = await db.query(
      `SELECT id, report_type, urgency, uploaded_at, ai_summary
       FROM reports WHERE patient_id = ?
       ORDER BY uploaded_at DESC LIMIT 10`, [id]);

    // Health score calculation
    const critical = urgencyCounts.find(u => u.urgency === 'critical')?.count || 0;
    const moderate = urgencyCounts.find(u => u.urgency === 'moderate')?.count || 0;
    const normal   = urgencyCounts.find(u => u.urgency === 'normal')?.count || 0;
    let healthScore = 100;
    healthScore -= critical * 15;
    healthScore -= moderate * 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    res.json({
      healthScore,
      totalReports,
      totalVisits,
      activeRx,
      critical,
      moderate,
      normal,
      prescriptions,
      appointments,
      reports
    });

  } catch (err) {
    console.error('Health dashboard error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;