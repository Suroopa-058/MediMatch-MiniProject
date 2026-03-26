const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

router.post('/', verifyToken, appointmentController.createAppointment);
router.get('/doctor', verifyToken, appointmentController.getDoctorAppointments);
router.put('/:id/status', verifyToken, appointmentController.updateAppointmentStatus);
router.get('/my', verifyToken, appointmentController.getPatientAppointments);

// ✅ NEW routes
router.post('/verify-otp', verifyToken, appointmentController.verifyOTP);
router.post('/prescription', verifyToken, appointmentController.savePrescription);
router.get('/prescription/:appointment_id', verifyToken, appointmentController.getPatientPrescription);

module.exports = router;