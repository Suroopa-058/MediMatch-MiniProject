import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import Landing from './pages/Landing';
import RoleSelect from './pages/RoleSelect';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientLogin from './pages/patient/PatientLogin';
import PatientRegister from './pages/patient/PatientRegister';
import PatientDashboard from './pages/patient/PatientDashboard';
import LabFinder from './pages/patient/LabFinder';
import ReportUpload from './pages/patient/ReportUpload';
import AIAnalysis from './pages/patient/AIAnalysis';
import MedicineScan from './pages/patient/MedicineScan';
import ScanResult from './pages/patient/ScanResult';
import DoctorSwipe from './pages/patient/DoctorSwipe';
import OTPConfirm from './pages/patient/OTPConfirm';
import VideoConsult from './pages/patient/VideoConsult';
import HealthDashboard from './pages/patient/HealthDashboard';
import Reminders from './pages/patient/Reminders';
import Settings from './pages/patient/Settings';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorRegister from './pages/doctor/DoctorRegister';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AppointmentRequests from './pages/doctor/AppointmentRequests';
import PatientReport from './pages/doctor/PatientReport';
import DoctorVideoConsult from './pages/doctor/DoctorVideoConsult';
import Prescription from './pages/doctor/Prescription';
import DoctorSettings from './pages/doctor/DoctorSettings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import LabLogin from './pages/lab/LabLogin';
import LabRegister from './pages/lab/LabRegister';
import LabDashboard from './pages/lab/LabDashboard';
import OTPVerify from './pages/OTPVerify';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/lab/login" element={<LabLogin />} />
<Route path="/lab/register" element={<LabRegister />} />
<Route path="/lab/dashboard" element={<LabDashboard />} />
      <Route path="/verify-otp" element={<OTPVerify />} />
        {/* Protected Patient Routes */}
        <Route path="/patient/dashboard" element={
          <PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
        <Route path="/patient/lab-finder" element={
          <PrivateRoute role="patient"><LabFinder /></PrivateRoute>} />
        <Route path="/patient/report-upload" element={
          <PrivateRoute role="patient"><ReportUpload /></PrivateRoute>} />
        <Route path="/patient/ai-analysis" element={
          <PrivateRoute role="patient"><AIAnalysis /></PrivateRoute>} />
        <Route path="/patient/medicine-scan" element={
          <PrivateRoute role="patient"><MedicineScan /></PrivateRoute>} />
        <Route path="/patient/scan-result" element={
          <PrivateRoute role="patient"><ScanResult /></PrivateRoute>} />
        <Route path="/patient/doctor-swipe" element={
          <PrivateRoute role="patient"><DoctorSwipe /></PrivateRoute>} />
        <Route path="/patient/otp-confirm" element={
          <PrivateRoute role="patient"><OTPConfirm /></PrivateRoute>} />
        <Route path="/patient/video-consult/:appointmentId" element={
          <PrivateRoute role="patient"><VideoConsult /></PrivateRoute>} />
        <Route path="/patient/health-dashboard" element={
          <PrivateRoute role="patient"><HealthDashboard /></PrivateRoute>} />
        <Route path="/patient/reminders" element={
          <PrivateRoute role="patient"><Reminders /></PrivateRoute>} />
        <Route path="/patient/settings" element={
          <PrivateRoute role="patient"><Settings /></PrivateRoute>} />

        {/* Protected Doctor Routes */}
        <Route path="/doctor/dashboard" element={
          <PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/appointments" element={
          <PrivateRoute role="doctor"><AppointmentRequests /></PrivateRoute>} />
        <Route path="/doctor/patient-report" element={
          <PrivateRoute role="doctor"><PatientReport /></PrivateRoute>} />
        <Route path="/doctor/video-consult/:appointmentId" element={
          <PrivateRoute role="doctor"><DoctorVideoConsult /></PrivateRoute>} />
        <Route path="/doctor/prescription" element={
          <PrivateRoute role="doctor"><Prescription /></PrivateRoute>} />
        <Route path="/doctor/settings" element={
          <PrivateRoute role="doctor"><DoctorSettings /></PrivateRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;