import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';

export default function AppointmentRequests() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Pending', 'Confirmed', 'Completed'];

  // Fetch real appointments from DB
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://medimatch-backend-4t7f.onrender.com/api/appointments/doctor', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Appointments fetch error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = appointments.filter(a =>
    filter === 'All' ? true : a.status === filter.toLowerCase()
  );

  // Accept/Reject saves to DB
  const handleAccept = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`https://medimatch-backend-4t7f.onrender.com/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'confirmed' })
    });
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a)
    );
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`https://medimatch-backend-4t7f.onrender.com/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    setAppointments(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a)
    );
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const urgencyConfig = {
    critical: { badge: 'bg-red-100 text-red-700',      label: '🔴 Critical',  border: 'border-l-red-500' },
    moderate: { badge: 'bg-orange-100 text-orange-700', label: '🟡 Moderate',  border: 'border-l-orange-500' },
    mild:     { badge: 'bg-yellow-100 text-yellow-700', label: '🟡 Mild',      border: 'border-l-yellow-400' },
    normal:   { badge: 'bg-green-100 text-green-700',   label: '🟢 Normal',    border: 'border-l-green-500' },
  };

  const statusConfig = {
    pending:   { badge: 'bg-orange-100 text-orange-700', label: 'Pending' },
    confirmed: { badge: 'bg-green-100 text-green-700',   label: 'Confirmed' },
    completed: { badge: 'bg-blue-100 text-blue-700',     label: 'Completed' },
    rejected:  { badge: 'bg-red-100 text-red-700',       label: 'Rejected' },
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📋 Appointment Requests</h2>
            <p className="text-gray-400 text-sm mt-1">Review and accept incoming patient bookings</p>
          </div>
          {pendingCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-sm font-bold px-4 py-2 rounded-xl">
              ⏳ {pendingCount} Pending
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',     value: appointments.length,                                   color: 'bg-blue-50 text-blue-700' },
            { label: 'Pending',   value: appointments.filter(a=>a.status==='pending').length,   color: 'bg-orange-50 text-orange-700' },
            { label: 'Confirmed', value: appointments.filter(a=>a.status==='confirmed').length, color: 'bg-green-50 text-green-700' },
            { label: 'Completed', value: appointments.filter(a=>a.status==='completed').length, color: 'bg-gray-50 text-gray-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-6">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '3px solid #2563eb', borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Appointment Cards */}
        {!loading && (
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-400 font-medium">No appointments in this category</p>
              </div>
            )}

            {filtered.map((a) => {
              const urgency = a.urgency || 'normal';
              const urg = urgencyConfig[urgency] || urgencyConfig.normal;
              const sta = statusConfig[a.status] || statusConfig.pending;
              const isExpanded = expanded === a.id;

              return (
                <div key={a.id}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${urg.border} transition-all`}>

                  {/* Main Row */}
                  <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-all"
                    onClick={() => setExpanded(isExpanded ? null : a.id)}>
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                      {a.gender === 'Female' ? '👩' : '👨'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-800">{a.patient_name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sta.badge}`}>{sta.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urg.badge}`}>{urg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Age {a.age} · {a.gender} · 📅 {formatDate(a.appointment_date)} · 🕐 {formatTime(a.appointment_time)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">📄 {a.reason || 'Consultation'}</p>
                    </div>
                    <div className="text-right mr-2">
                      <div className="text-base font-bold text-blue-700">
                        {a.fee ? `₹${a.fee}` : '₹800'}
                      </div>
                      <div className="text-xs text-gray-400">consult fee</div>
                    </div>

                    {/* Action Buttons */}
                    {a.status === 'pending' && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleReject(a.id)}
                          className="border-2 border-red-200 text-red-500 hover:bg-red-50 text-sm font-bold px-4 py-2 rounded-xl transition-all">
                          ✕ Reject
                        </button>
                        <button onClick={() => handleAccept(a.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">
                          ✓ Accept
                        </button>
                      </div>
                    )}

                    {a.status === 'confirmed' && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate('/doctor/patient-report')}
                          className="border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                          📄 View Report
                        </button>
                        <button onClick={() => navigate(`/doctor/video-consult/${a.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">
                          🎥 Start Call
                        </button>
                      </div>
                    )}

                    {a.status === 'completed' && (
                      <button onClick={() => navigate('/doctor/prescription')}
                        className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                        💊 View Rx
                      </button>
                    )}

                    <span className="text-gray-300 text-sm ml-1">{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-1">Contact</div>
                          <div className="font-semibold text-gray-800">{a.phone || 'Not provided'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-1">Appointment Date</div>
                          <div className="font-semibold text-gray-800">{formatDate(a.appointment_date)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-400 mb-1">Consult Fee</div>
                          <div className="font-semibold text-blue-700">{a.fee ? `₹${a.fee}` : '₹800'}</div>
                        </div>
                      </div>
                      {a.status === 'confirmed' && (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => navigate(`/doctor/patient-report?appointmentId=${a.id}`)}
                            className="flex-1 border border-blue-200 text-blue-600 hover:bg-blue-50 py-2 rounded-xl text-sm font-semibold transition-all">
                            📄 View Full Report
                          </button>
                          <button onClick={() => navigate(`/doctor/video-consult/${a.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold transition-all">
                            🎥 Start Video Call
                          </button>
                          <button onClick={() => navigate('/doctor/prescription')}
                            className="flex-1 border border-purple-200 text-purple-600 hover:bg-purple-50 py-2 rounded-xl text-sm font-semibold transition-all">
                            💊 Write Prescription
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}