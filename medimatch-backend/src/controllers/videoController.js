const { RtcTokenBuilder, RtcRole } = require('agora-token');
const db = require('../config/db');

const APP_ID          = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

exports.generateToken = (req, res) => {
  try {
    const { appointmentId, role } = req.body;
    const userId = req.user.id;
    const channelName = `appointment_${appointmentId}`;
    const expireTime  = Math.floor(Date.now() / 1000) + 3600;
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID, APP_CERTIFICATE, channelName,
      userId, RtcRole.PUBLISHER, expireTime
    );
    db.query(
      `INSERT INTO video_sessions (appointment_id, started_by, started_at)
       VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE started_at = NOW()`,
      [appointmentId, userId]
    );
    res.json({ token, channelName, appId: APP_ID, uid: userId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

exports.saveMessage = (req, res) => {
  const { appointmentId, message, senderRole } = req.body;
  const senderId = req.user.id;
  db.query(
    `INSERT INTO chat_messages (appointment_id, sender_id, sender_role, message, sent_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [appointmentId, senderId, senderRole, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to save message' });
      res.json({ success: true, messageId: result.insertId });
    }
  );
};

exports.getMessages = (req, res) => {
  const { appointmentId } = req.params;
  db.query(
    `SELECT cm.*,
       CASE WHEN cm.sender_role='doctor' THEN d.full_name ELSE p.full_name END AS sender_name
     FROM chat_messages cm
     LEFT JOIN doctors d  ON cm.sender_id = d.id AND cm.sender_role = 'doctor'
     LEFT JOIN patients p ON cm.sender_id = p.id AND cm.sender_role = 'patient'
     WHERE cm.appointment_id = ? ORDER BY cm.sent_at ASC`,
    [appointmentId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch messages' });
      res.json(results);
    }
  );
};

exports.endCall = (req, res) => {
  const { appointmentId } = req.body;
  db.query(
    `UPDATE video_sessions SET ended_at = NOW(),
     duration_minutes = TIMESTAMPDIFF(MINUTE, started_at, NOW())
     WHERE appointment_id = ?`,
    [appointmentId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to end session' });
      db.query(`UPDATE appointments SET status='completed' WHERE id=?`, [appointmentId]);
      res.json({ success: true });
    }
  );
};