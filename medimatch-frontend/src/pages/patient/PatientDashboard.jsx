import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';
import AIChat from '../../components/patient/AIChat';
import { getMyLabReports } from '../../services/labReportService';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [labReports, setLabReports] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('patient');
    const token = localStorage.getItem('token');
    if (stored) setPatient(JSON.parse(stored));

    fetch('https://medimatch-backend-4t7f.onrender.com/api/stats/patient', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setDashStats(data))
      .catch(err => console.error('Stats error:', err));

    getMyLabReports()
      .then(data => setLabReports(Array.isArray(data) ? data : []))
      .catch(err => console.error('Lab reports error:', err));
  }, []);

  const firstName = patient?.full_name?.split(' ')[0] || 'Patient';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = () => {
    if (!patient?.full_name) return 'P';
    return patient.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getNextApptLabel = () => {
    if (!dashStats?.nextAppt) return 'None scheduled';
    const d = new Date(dashStats.nextAppt);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return 'Next: Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Next: Tomorrow';
    return `Next: ${d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
  };

  const stats = [
    {
      icon: '📋',
      value: dashStats ? String(dashStats.reports) : '...',
      label: 'Reports Uploaded',
      badge: dashStats ? `+${dashStats.reportsThisWeek} this week` : '...',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      icon: '👨‍⚕️',
      value: dashStats ? String(dashStats.appointments) : '...',
      label: 'Upcoming Appointments',
      badge: getNextApptLabel(),
      badgeColor: 'bg-orange-100 text-orange-700'
    },
    {
      icon: '🧪',
      value: '3',
      label: 'Labs Visited',
      badge: 'All verified',
      badgeColor: 'bg-teal-100 text-teal-700'
    },
    {
      icon: '❤️',
      value: 'Good',
      label: 'Overall Health',
      badge: 'Stable',
      badgeColor: 'bg-green-100 text-green-700'
    },
  ];

  const quickActions = [
    { icon: '🧪', label: 'Find Nearby Lab',  desc: 'Locate certified labs near you using GPS',      bg: 'bg-green-50',  path: '/patient/lab-finder' },
    { icon: '📄', label: 'Upload Report',     desc: 'Upload your report for AI-powered analysis',    bg: 'bg-teal-50',   path: '/patient/report-upload' },
    { icon: '👨‍⚕️', label: 'Book Doctor',   desc: 'Browse and book a specialist directly',         bg: 'bg-blue-50',   path: '/patient/doctor-swipe' },
    { icon: '📊', label: 'Health Dashboard',  desc: 'View your full health history and vitals',      bg: 'bg-purple-50', path: '/patient/health-dashboard' },
    { icon: '🎥', label: 'Video Consult',     desc: 'Join your upcoming video consultation',         bg: 'bg-orange-50', path: null },
    { icon: '🔔', label: 'Reminders',         desc: 'Manage your medication & follow-up reminders',  bg: 'bg-red-50',    path: '/patient/reminders' },
  ];

  const getUrgencyColor = (urgency) => {
    const map = {
      critical: 'bg-red-100 text-red-700',
      moderate: 'bg-orange-100 text-orange-700',
      mild: 'bg-yellow-100 text-yellow-700',
      normal: 'bg-green-100 text-green-700',
    };
    return map[urgency] || 'bg-gray-100 text-gray-600';
  };

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-orange-100 text-orange-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const reportIcons = {
    blood: '🩸', ecg: '🫀', xray: '🦴',
    mri: '🧠', ct: '🔬', urine: '🧪',
    thyroid: '⚗️', other: '📋'
  };

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />

      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, {firstName} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · Here\'s your health overview'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 cursor-pointer hover:border-teal-300 transition-all">
              🔔 3 Notifications
            </div>
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {getInitials()}
            </div>
          </div>
        </div>

        {/* Patient Info Bar */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-3 mb-6 flex items-center gap-4 flex-wrap">
          <span className="text-teal-600 text-sm font-semibold">👤 {patient.full_name}</span>
          {patient.email && <span className="text-gray-400 text-xs">📧 {patient.email}</span>}
          {patient.phone && <span className="text-gray-400 text-xs">📱 {patient.phone}</span>}
          {patient.blood_group && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              🩸 {patient.blood_group}
            </span>
          )}
          {patient.age && <span className="text-gray-400 text-xs">Age: {patient.age}</span>}
          <button
            onClick={() => { localStorage.clear(); navigate('/patient/login'); }}
            className="ml-auto text-xs text-red-400 hover:text-red-600 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h3 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {quickActions.map((a) => (
            <div
              key={a.label}
              onClick={() => {
  if (a.label === 'Video Consult') {
    const appt = dashStats?.upcoming?.find(appt =>
      appt.status === 'confirmed' || appt.status === 'pending'
    );
    if (appt) {
      if (appt.status === 'pending') {
        alert('Your appointment is still pending doctor approval. Please wait.');
      } else {
        navigate(`/patient/video-consult/${appt.id}`);
      }
    } else {
      alert('No upcoming appointments. Please book first.');
    }
  } else {
    navigate(a.path);
  }
}}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:border-teal-300 hover:shadow-md transition-all group"
            >
              <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>
                {a.icon}
              </div>
              <div className="text-sm font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                {a.label}
              </div>
              <div className="text-xs text-gray-400 mt-1 leading-relaxed">{a.desc}</div>
            </div>
          ))}
        </div>

        {/* Bottom Three Columns */}
        <div className="grid grid-cols-3 gap-6">

          {/* Upcoming Appointments — REAL DATA */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Upcoming Appointments</h3>
              <span className="text-xs text-teal-600 font-semibold cursor-pointer hover:underline">View All</span>
            </div>

            {!dashStats ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full animate-spin"
                  style={{ border: '3px solid #0d9488', borderTopColor: 'transparent' }} />
              </div>
            ) : dashStats.upcoming?.length > 0 ? (
              dashStats.upcoming.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-lg">🩺</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Dr. {a.doctor_name}</div>
                    <div className="text-xs text-gray-400">
                      {a.specialization} · {new Date(a.appointment_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(a.status)}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                    {a.status === 'confirmed' && (
                      <button
                        onClick={() => navigate(`/patient/video-consult/${a.id}`)}
                        className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded-full font-semibold transition-all"
                      >
                        🎥 Join
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">No upcoming appointments</p>
              </div>
            )}

            <button
              onClick={() => navigate('/patient/doctor-swipe')}
              className="w-full mt-4 border border-teal-200 text-teal-600 hover:bg-teal-50 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              + Book New Appointment
            </button>
          </div>

          {/* Recent Reports — REAL DATA */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Recent Reports</h3>
              <span className="text-xs text-teal-600 font-semibold cursor-pointer hover:underline">View All</span>
            </div>

            {!dashStats ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full animate-spin"
                  style={{ border: '3px solid #0d9488', borderTopColor: 'transparent' }} />
              </div>
            ) : dashStats.recentReports?.length > 0 ? (
              dashStats.recentReports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-lg">
                    {reportIcons[r.report_type] || '📋'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800 capitalize">
                      {r.report_type} Report
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.uploaded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getUrgencyColor(r.urgency)}`}>
                    {r.urgency ? r.urgency.charAt(0).toUpperCase() + r.urgency.slice(1) : 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm">No reports uploaded yet</p>
              </div>
            )}

            <button
              onClick={() => navigate('/patient/report-upload')}
              className="w-full mt-4 border border-teal-200 text-teal-600 hover:bg-teal-50 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              + Upload New Report
            </button>
          </div>

          {/* Reports from Lab — REAL DATA */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Reports from Lab</h3>
            </div>

            {labReports.length > 0 ? (
              labReports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center text-lg">🧪</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{r.report_type}</div>
                    <div className="text-xs text-gray-400">
                      {r.lab_name} · {new Date(r.uploaded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <a
                    href={`https://medimatch-backend-4t7f.onrender.com${r.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded-full font-semibold"
                  >
                    ⬇ Download
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">🧪</div>
                <p className="text-sm">No lab reports yet</p>
              </div>
            )}
          </div>

        </div>
      </div>
      <AIChat />
    </div>
  );
}
