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
const scanRoutes = require('./src/routes/scanRoutes');
const labAuthRoutes = require('./src/routes/labAuthRoutes');
const labRoutes = require('./src/routes/labRoutes');
const patientLabReportRoutes = require('./src/routes/patientLabReportRoutes');
const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────
// Added the deployed Vercel frontend URL alongside the existing localhost
// origins (kept those too, so local development still works normally).
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://medi-match-mini-project.vercel.app',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/lab/auth', labAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scan', scanRoutes);

app.use('/api/lab', labRoutes);
app.use('/api/patient-lab-reports', patientLabReportRoutes);
app.get('/', (req, res) => {
  res.json({ message: '✅ MediMatch Backend Running!' });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

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
    socket.to(room).emit('call-ended', { endedBy });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.set('io', io);

httpServer.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Server running on http://localhost:5000');
  console.log('🔌 Socket.io ready for real-time call signaling');
});