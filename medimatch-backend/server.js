require('dotenv').config(); // ← MUST BE FIRST!
const express = require('express');
const cors = require('cors');

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

app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Server running on http://localhost:5000');
});