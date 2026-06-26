import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [dashStats, setDashStats] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('doctor');
    const token = localStorage.getItem('token');
    if (stored) setDoctor(JSON.parse(stored));

    fetch('https://medimatch-backend-4t7f.onrender.com/api/stats/doctor', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setDashStats(data))
      .catch(err => console.error('Doctor stats error:', err));
  }, []);

  const firstName = doctor?.full_name
  ?.replace(/^Dr\.?\s*/i, '')
  .split(' ')[0] || 'Doctor';
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = () => {
    if (!doctor?.full_name) return 'DR';
    return doctor.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-orange-100 text-orange-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const getUrgencyColor = (urgency) => {
    const map = {
      critical: 'bg-red-100 text-red-700',
      moderate: 'bg-orange-100 text-orange-700',
      mild: 'bg-yellow-100 text-yellow-700',
      normal: 'bg-green-100 text-green-700',
    };
    return map[urgency] || 'bg-gray-100 text-gray-600';
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const stats = [
    {
      icon: '📅',
      value: dashStats ? String(dashStats.todayAppts) : '...',
      label: "Today's Appointments",
      badge: dashStats ? `${dashStats.pending} pending` : '...',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      icon: '👥',
      value: dashStats ? String(dashStats.totalPatients) : '...',
      label: 'Total Patients',
      badge: 'All time',
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      icon: '📄',
      value: dashStats ? String(dashStats.reportsToReview) : '...',
      label: 'Reports to Review',
      badge: 'Needs attention',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      icon: '⭐',
      value: doctor?.rating ?? '4.5',
      label: 'Doctor Rating',
      badge: 'Verified',
      badgeColor: 'bg-yellow-100 text-yellow-700'
    },
  ];

  const quickActions = [
    { icon: '📋', label: 'View Requests',     desc: `${dashStats?.pending ?? 0} pending approvals`, bg: 'bg-blue-50',   path: '/doctor/appointments' },
    { icon: '📄', label: 'Patient Reports',   desc: 'Review AI analysis',                           bg: 'bg-orange-50', path: '/doctor/patient-report' },
    { icon: '🎥', label: 'Start Video Call', desc: 'Join consultation', bg: 'bg-green-50', path: '/doctor/appointments' },
    { icon: '💊', label: 'Write Prescription',desc: 'For current patient',                           bg: 'bg-purple-50', path: '/doctor/prescription' },
  ];

  if (!doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />

      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, Dr. {firstName} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {" · Here's your practice overview"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 cursor-pointer hover:border-blue-300 transition-all">
              🔔 {dashStats?.pending ?? 0} Alerts
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {getInitials()}
            </div>
          </div>
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickActions.map((a) => (
            <div
              key={a.label}
              onClick={() => navigate(a.path)}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>
                {a.icon}
              </div>
              <div className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                {a.label}
              </div>
              <div className="text-xs text-gray-400 mt-1">{a.desc}</div>
            </div>
          ))}
        </div>

        {/* Bottom Two Columns */}
        <div className="grid grid-cols-2 gap-6">

          {/* Today's Appointments — REAL DATA */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Today's Appointments</h3>
              <span onClick={() => navigate('/doctor/appointments')}
                className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                View All
              </span>
            </div>

            {!dashStats ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full animate-spin"
                  style={{ border: '3px solid #2563eb', borderTopColor: 'transparent' }} />
              </div>
            ) : dashStats.todayList?.length > 0 ? (
              dashStats.todayList.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-lg">
                    {a.gender === 'Female' ? '👩' : '👨'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{a.patient_name}</div>
                    <div className="text-xs text-gray-400">
                      {a.reason || 'Consultation'} · {formatTime(a.appointment_time)}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(a.status)}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm">No appointments today</p>
              </div>
            )}

            <button onClick={() => navigate('/doctor/appointments')}
              className="w-full mt-4 border border-blue-200 text-blue-600 hover:bg-blue-50 py-2 rounded-xl text-sm font-semibold transition-all">
              + View All Requests
            </button>
          </div>

          {/* Recent Patient Reports — REAL DATA */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800">Recent Patient Reports</h3>
              <span onClick={() => navigate('/doctor/patient-report')}
                className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                View All
              </span>
            </div>

            {!dashStats ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 rounded-full animate-spin"
                  style={{ border: '3px solid #2563eb', borderTopColor: 'transparent' }} />
              </div>
            ) : dashStats.recentReports?.length > 0 ? (
              dashStats.recentReports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-lg">🩸</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">
                      {r.patient_name} — {r.report_type} Report
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(r.uploaded_at)}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getUrgencyColor(r.urgency)}`}>
                    {r.urgency ? r.urgency.charAt(0).toUpperCase() + r.urgency.slice(1) : 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm">No patient reports yet</p>
              </div>
            )}

            <button onClick={() => navigate('/doctor/patient-report')}
              className="w-full mt-4 border border-orange-200 text-orange-600 hover:bg-orange-50 py-2 rounded-xl text-sm font-semibold transition-all">
              📄 Review Reports
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}