const express = require('express');
const router = express.Router();
const { labRegister, labLogin } = require('../controllers/labController');

router.post('/register', labRegister);
router.post('/login', labLogin);

module.exports = router;