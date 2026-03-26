const express = require('express');
const router = express.Router();
const { 
  patientRegister, 
  patientLogin, 
  doctorRegister, 
  doctorLogin 
} = require('../controllers/authController');

router.post('/patient/register', patientRegister);
router.post('/patient/login', patientLogin);
router.post('/doctor/register', doctorRegister);
router.post('/doctor/login', doctorLogin);

module.exports = router;