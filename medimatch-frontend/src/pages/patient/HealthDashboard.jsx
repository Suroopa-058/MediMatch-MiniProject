import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';
import axios from 'axios';

const VITALS = [
  { icon: '❤️', label: 'Heart Rate',     value: '72',    unit: 'bpm',   status: 'normal', trend: '↔ Stable' },
  { icon: '🩸', label: 'Blood Pressure', value: '118/78', unit: 'mmHg', status: 'normal', trend: '↔ Stable' },
  { icon: '🍬', label: 'Blood Glucose',  value: '185',   unit: 'mg/dL', status: 'high',   trend: '↑ High' },
  { icon: '🌡️', label: 'Temperature',   value: '98.6',  unit: '°F',    status: 'normal', trend: '↔ Normal' },
  { icon: '💨', label: 'SpO2',           value: '98',    unit: '%',     status: 'normal', trend: '↔ Normal' },
  { icon: '⚖️', label: 'BMI',            value: '24.2',  unit: 'kg/m²', status: 'normal', trend: '↔ Healthy' },
];

const FAMILY = [
  { name: 'Suroopa', relation: 'You',    age: 24, blood: 'B+', status: 'Moderate', icon: '👩', statusColor: 'text-orange-500' },
  { name: 'Rathi',          relation: 'Mother', age: 50, blood: 'O+', status: 'Good',     icon: '👩', statusColor: 'text-green-500' },
  { name: 'Ravi',           relation: 'Father', age: 54, blood: 'B+', status: 'Good',     icon: '👨', statusColor: 'text-green-500' },
];

export default function HealthDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('https://medimatch-backend-4t7f.onrender.com/api/stats/health-dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDashData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview',      label: '📊 Overview' },
    { id: 'vitals',        label: '❤️ Vitals' },
    { id: 'timeline',      label: '📅 History' },
    { id: 'family',        label: '👨‍👩‍👧 Family' },
    { id: 'prescriptions', label: '💊 Prescriptions' },
  ];

  // Build timeline from real appointments + reports
  const buildTimeline = () => {
    const items = [];
    (dashData?.appointments || []).forEach(a => {
      items.push({
        date: new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        icon: '👨‍⚕️',
        event: 'Appointment',
        desc: `${a.doctor_name} — ${a.specialization}`,
        badge: a.status === 'completed' ? '✅ Done' : '📅 Upcoming',
        badgeColor: a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      });
    });
    (dashData?.reports || []).forEach(r => {
      items.push({
        date: new Date(r.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        icon: '📄',
        event: 'Report Uploaded',
        desc: r.report_type || 'Medical Report',
        badge: r.urgency === 'critical' ? '🔴 Critical' : r.urgency === 'moderate' ? '⚠️ Moderate' : '🟢 Normal',
        badgeColor: r.urgency === 'critical' ? 'bg-red-100 text-red-700' : r.urgency === 'moderate' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
      });
    });
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const healthScore = dashData?.healthScore ?? 72;
  const timeline = buildTimeline();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📊 Health Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">Your complete health history and vitals at a glance</p>
          </div>
          <button onClick={() => navigate('/patient/report-upload')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md">
            + Upload New Report
          </button>
        </div>

        {/* Health Score Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${healthScore} 100`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{healthScore}</span>
                <span className="text-xs text-teal-200">/100</span>
              </div>
            </div>
            <div>
              <div className="text-lg font-bold">Health Score</div>
              <div className="text-teal-100 text-sm">
                {healthScore >= 80 ? 'Good — Keep it up!' : healthScore >= 60 ? 'Moderate — Needs attention' : 'Critical — See a doctor'}
              </div>
              <div className="flex gap-2 mt-2">
                <span className="bg-white bg-opacity-20 text-xs px-2 py-0.5 rounded-full">🔴 {dashData?.critical ?? 1} Critical</span>
                <span className="bg-white bg-opacity-20 text-xs px-2 py-0.5 rounded-full">🟡 {dashData?.moderate ?? 2} Watch</span>
                <span className="bg-white bg-opacity-20 text-xs px-2 py-0.5 rounded-full">🟢 {dashData?.normal ?? 3} Normal</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: dashData?.totalReports ?? '—', label: 'Reports' },
              { value: dashData?.totalVisits  ?? '—', label: 'Visits' },
              { value: dashData?.activeRx     ?? '—', label: 'Active Rx' },
            ].map(s => (
              <div key={s.label} className="bg-white bg-opacity-10 rounded-xl px-4 py-3">
                <div className="text-xl font-bold">{loading ? '...' : s.value}</div>
                <div className="text-xs text-teal-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${activeTab === t.id ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500 hover:text-teal-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-4">Latest Vitals</h3>
                <div className="grid grid-cols-3 gap-3">
                  {VITALS.map(v => (
                    <div key={v.label} className={`rounded-xl p-3 border ${v.status === 'high' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{v.icon}</span>
                        <span className={`text-xs font-bold ${v.status === 'high' ? 'text-red-600' : 'text-green-600'}`}>{v.trend}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-800">{v.value} <span className="text-xs text-gray-400">{v.unit}</span></div>
                      <div className="text-xs text-gray-500">{v.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-800">Recent Activity</h3>
                  <button onClick={() => setActiveTab('timeline')} className="text-xs text-teal-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {(timeline.slice(0, 3)).map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">{t.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-800">{t.event}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{t.date}</p>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && !loading && (
                    <p className="text-xs text-gray-400 text-center py-4">No activity yet</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Family Members</h3>
                  <button onClick={() => setActiveTab('family')} className="text-xs text-teal-600 font-semibold hover:underline">View All</button>
                </div>
                {FAMILY.map(f => (
                  <div key={f.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-xl">{f.icon}</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">{f.name}</div>
                      <div className="text-xs text-gray-400">{f.relation} · {f.blood}</div>
                    </div>
                    <span className={`text-xs font-bold ${f.statusColor}`}>{f.status}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Active Prescriptions</h3>
                {loading ? (
                  <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
                ) : (dashData?.prescriptions || []).length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No prescriptions yet</p>
                ) : (
                  (dashData?.prescriptions || []).slice(0, 3).map((p, i) => {
                    const meds = typeof p.medications === 'string' ? JSON.parse(p.medications) : p.medications;
                    return meds?.slice(0, 1).map((m, j) => (
                      <div key={`${i}-${j}`} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <span className="text-xl">💊</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-800">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.dose} · {m.freq}</div>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                      </div>
                    ));
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className="grid grid-cols-3 gap-4">
            {VITALS.map(v => (
              <div key={v.label} className={`bg-white rounded-2xl p-6 border shadow-sm ${v.status === 'high' ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{v.icon}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.status === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {v.status === 'high' ? '↑ High' : '✓ Normal'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-800">{v.value}</div>
                <div className="text-sm text-gray-400">{v.unit}</div>
                <div className="text-base font-semibold text-gray-700 mt-1">{v.label}</div>
                <div className={`text-xs font-medium mt-2 ${v.status === 'high' ? 'text-red-500' : 'text-green-500'}`}>{v.trend}</div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 mb-6">Medical History Timeline</h3>
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading history...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No history yet</p>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-teal-100"/>
                <div className="space-y-6">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className="w-10 h-10 bg-white border-2 border-teal-200 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10">
                        {t.icon}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-800">{t.event}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                        <p className="text-xs text-gray-300 mt-1">📅 {t.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Family Tab */}
        {activeTab === 'family' && (
          <div className="grid grid-cols-3 gap-4">
            {FAMILY.map(f => (
              <div key={f.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">{f.icon}</div>
                <h3 className="text-base font-bold text-gray-800">{f.name}</h3>
                <p className="text-sm text-teal-600 font-medium">{f.relation}</p>
                <div className="flex justify-center gap-3 mt-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Age {f.age}</span>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">{f.blood}</span>
                </div>
                <div className={`mt-3 text-sm font-bold ${f.statusColor}`}>{f.status}</div>
              </div>
            ))}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-teal-300 transition-all">
              <div className="text-4xl mb-2">➕</div>
              <p className="text-sm font-semibold text-gray-500">Add Family Member</p>
            </div>
          </div>
        )}

        {/* Prescriptions Tab — REAL DATA */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading prescriptions...</p>
            ) : (dashData?.prescriptions || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No prescriptions yet</p>
            ) : (
              (dashData?.prescriptions || []).map((rx, i) => {
                const meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications;
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">Prescribed by {rx.doctor_name}</h3>
                        <p className="text-xs text-gray-400">{rx.specialization} · {new Date(rx.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">{rx.diagnosis?.substring(0, 30)}...</span>
                    </div>
                    <div className="space-y-2">
                      {(meds || []).map((m, j) => (
                        <div key={j} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">💊</span>
                            <div>
                              <div className="text-sm font-bold text-gray-800">{m.name}</div>
                              <div className="text-xs text-gray-500">{m.dose} · {m.freq} · {m.duration}</div>
                            </div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
