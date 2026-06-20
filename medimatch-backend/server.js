require('dotenv').config(); // ← MUST BE FIRST!
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./src/routes/authRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.json({ message: '✅ MediMatch Backend Running!' });
});

// ─── Create HTTP server explicitly so Socket.io can attach to it ─────────────

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true
  }
});

// ─── Socket.io: real-time call-end signaling ──────────────────────────────────
// Each patient/doctor joins a "room" named after their appointmentId when they
// open the video call page. When either side ends the call, we broadcast a
// "call-ended" event to that room — the other browser receives it instantly
// and can clean up / navigate away, regardless of what Agora's own events do.

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-call', ({ appointmentId }) => {
    const room = `appointment_${appointmentId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('end-call', ({ appointmentId, endedBy }) => {
    const room = `appointment_${appointmentId}`;
    console.log(`Call ended in room ${room} by ${endedBy}`);
    // Notify everyone else in the room (the other participant)
    socket.to(room).emit('call-ended', { endedBy });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Make io accessible to routes/controllers if needed later (e.g. chat via sockets)
app.set('io', io);

httpServer.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Server running on http://localhost:5000');
  console.log('🔌 Socket.io ready for real-time call signaling');
});