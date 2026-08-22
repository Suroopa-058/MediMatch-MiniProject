const express = require('express');
const router = express.Router();
const { 
  patientRegister, 
  patientLogin, 
  doctorRegister, 
  doctorLogin,
  sendOtp,
  verifyOtp,
} = require('../controllers/authController');

router.post('/patient/register', patientRegister);
router.post('/patient/login', patientLogin);
router.post('/doctor/register', doctorRegister);
router.post('/doctor/login', doctorLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;