const express = require('express');
const router = express.Router();
const { generateToken, saveMessage, getMessages, endCall } = require('../controllers/videoController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/token', verifyToken, generateToken);
router.post('/message', verifyToken, saveMessage);
router.get('/messages/:appointmentId', verifyToken, getMessages);
router.post('/end', verifyToken, endCall);

module.exports = router;