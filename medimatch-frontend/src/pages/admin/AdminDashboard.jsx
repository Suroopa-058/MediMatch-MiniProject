import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, doctorsRes, patientsRes, apptsRes] = await Promise.all([
        fetch('https://medimatch-backend-4t7f.onrender.com/api/admin/stats', { headers }),
        fetch('https://medimatch-backend-4t7f.onrender.com/api/admin/doctors', { headers }),
        fetch('https://medimatch-backend-4t7f.onrender.com/api/admin/patients', { headers }),
        fetch('https://medimatch-backend-4t7f.onrender.com/api/admin/appointments', { headers }),
      ]);
      setStats(await statsRes.json());
      setDoctors(await doctorsRes.json());
      setPatients(await patientsRes.json());
      setAppointments(await apptsRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleVerifyDoctor = async (id, action) => {
    await fetch(`https://medimatch-backend-4t7f.onrender.com/api/admin/doctors/${id}/verify`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, is_verified: action === 'approve' ? 1 : -1 } : d));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const tabs = ['overview', 'doctors', 'patients', 'appointments'];

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-56 bg-gray-900 text-white flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-lg">⚙️</div>
            <span className="font-bold text-sm">MediMatch Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'doctors', icon: '👨‍⚕️', label: 'Doctors' },
            { id: 'patients', icon: '🧑', label: 'Patients' },
            { id: 'appointments', icon: '📋', label: 'Appointments' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === t.id ? 'bg-white text-gray-900' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout}
            className="w-full text-red-400 hover:text-red-300 text-sm font-semibold py-2">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'overview' ? '📊 Admin Dashboard' :
               activeTab === 'doctors' ? '👨‍⚕️ Doctor Management' :
               activeTab === 'patients' ? '🧑 Patient Management' : '📋 All Appointments'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">MediMatch Admin Control Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">⚙️ Admin</span>
            <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #374151', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: '🧑', color: 'bg-blue-50 text-blue-700' },
                    { label: 'Total Doctors', value: stats?.totalDoctors ?? 0, icon: '👨‍⚕️', color: 'bg-teal-50 text-teal-700' },
                    { label: 'Pending Verifications', value: stats?.pendingDoctors ?? 0, icon: '⏳', color: 'bg-orange-50 text-orange-700' },
                    { label: 'Total Appointments', value: stats?.totalAppointments ?? 0, icon: '📋', color: 'bg-purple-50 text-purple-700' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-opacity-20`}>
                      <div className="text-3xl mb-2">{s.icon}</div>
                      <div className="text-3xl font-bold">{s.value}</div>
                      <div className="text-xs font-semibold mt-1 opacity-80">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pending Doctor Verifications */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-base font-bold text-gray-800 mb-4">⏳ Pending Doctor Verifications</h3>
                  {doctors.filter(d => !d.is_verified || d.is_verified === 0).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No pending verifications</p>
                  ) : (
                    <div className="space-y-3">
                      {doctors.filter(d => !d.is_verified || d.is_verified === 0).map(d => (
                        <div key={d.id} className="flex items-center justify-between bg-orange-50 rounded-xl p-4 border border-orange-100">
                          <div>
                            <div className="font-bold text-gray-800 text-sm">{d.full_name}</div>
                            <div className="text-xs text-gray-500">{d.specialization} · {d.hospital}</div>
                            <div className="text-xs text-gray-400">{d.email} · License: {d.license_no}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleVerifyDoctor(d.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                              ✅ Approve
                            </button>
                            <button onClick={() => handleVerifyDoctor(d.id, 'reject')}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-800">All Doctors ({doctors.length})</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {doctors.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-5 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-xl">👨‍⚕️</div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{d.full_name}</div>
                          <div className="text-xs text-gray-500">{d.specialization} · {d.hospital}</div>
                          <div className="text-xs text-gray-400">{d.email} · {d.phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full
                          ${d.is_verified === 1 ? 'bg-green-100 text-green-700' :
                            d.is_verified === -1 ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'}`}>
                          {d.is_verified === 1 ? '✅ Verified' : d.is_verified === -1 ? '❌ Rejected' : '⏳ Pending'}
                        </span>
                        {(!d.is_verified || d.is_verified === 0) && (
                          <div className="flex gap-2">
                            <button onClick={() => handleVerifyDoctor(d.id, 'approve')}
                              className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl">✅</button>
                            <button onClick={() => handleVerifyDoctor(d.id, 'reject')}
                              className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">❌</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patients Tab */}
            {activeTab === 'patients' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <span className="font-bold text-gray-800">All Patients ({patients.length})</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {patients.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-5 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">🧑</div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{p.full_name}</div>
                          <div className="text-xs text-gray-500">{p.email} · {p.phone}</div>
                          <div className="text-xs text-gray-400">Age: {p.age} · Blood: {p.blood_group} · Gender: {p.gender}</div>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <span className="font-bold text-gray-800">All Appointments ({appointments.length})</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {appointments.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-5 hover:bg-gray-50">
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{a.patient_name} → Dr. {a.doctor_name}</div>
                        <div className="text-xs text-gray-500">{a.specialization} · {new Date(a.appointment_date).toLocaleDateString()} · {a.appointment_time}</div>
                        <div className="text-xs text-gray-400">Reason: {a.reason} · Fee: ₹{a.fee}</div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full
                        ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          a.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          a.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}