import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

const REMINDER_TYPES = {
  medication: { label: 'Medication', icon: '💊', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  appointment: { label: 'Appointment', icon: '📅', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  followup: { label: 'Follow-up', icon: '🔁', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Once'];
const TIMES = ['06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM'];

const defaultForm = {
  title: '', type: 'medication', frequency: 'Daily',
  time: '08:00 AM', date: '', notes: '', active: true,
};

export default function Reminders() {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('patient') || '{}');

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('medimatch_reminders');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Metformin 500mg', type: 'medication', frequency: 'Daily', time: '08:00 AM', date: '', notes: 'Take after breakfast', active: true, createdAt: new Date().toISOString() },
      { id: 2, title: 'Blood Sugar Check', type: 'followup', frequency: 'Daily', time: '06:00 AM', date: '', notes: 'Check fasting blood sugar', active: true, createdAt: new Date().toISOString() },
      { id: 3, title: 'Next Appointment', type: 'appointment', frequency: 'Once', time: '10:00 AM', date: '2026-04-15', notes: 'Dr. Priya Sharma - Apollo Hospital', active: true, createdAt: new Date().toISOString() },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('medimatch_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const filtered = reminders.filter(r => {
    const matchFilter = filter === 'All' || r.type === filter.toLowerCase() ||
      (filter === 'Active' && r.active) || (filter === 'Inactive' && !r.active);
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSave = () => {
    if (!form.title.trim()) return alert('Please enter a title!');
    if (editId) {
      setReminders(prev => prev.map(r => r.id === editId ? { ...form, id: editId, createdAt: r.createdAt } : r));
    } else {
      setReminders(prev => [...prev, { ...form, id: Date.now(), createdAt: new Date().toISOString() }]);
    }
    setForm(defaultForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (r) => {
    setForm({ title: r.title, type: r.type, frequency: r.frequency, time: r.time, date: r.date, notes: r.notes, active: r.active });
    setEditId(r.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this reminder?')) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleActive = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const activeCount = reminders.filter(r => r.active).length;
  const medCount = reminders.filter(r => r.type === 'medication').length;
  const apptCount = reminders.filter(r => r.type === 'appointment').length;
  const followCount = reminders.filter(r => r.type === 'followup').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🔔 Reminders</h2>
            <p className="text-gray-400 text-sm mt-1">Manage your medication, appointment & follow-up reminders</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
            + Add Reminder
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active', value: activeCount, icon: '✅', color: 'bg-green-50 text-green-700' },
            { label: 'Medication', value: medCount, icon: '💊', color: 'bg-blue-50 text-blue-700' },
            { label: 'Appointments', value: apptCount, icon: '📅', color: 'bg-teal-50 text-teal-700' },
            { label: 'Follow-ups', value: followCount, icon: '🔁', color: 'bg-orange-50 text-orange-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center border border-opacity-20`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex items-center gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search reminders..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
          {['All', 'Active', 'Inactive', 'medication', 'appointment', 'followup'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-xl font-semibold border transition-all capitalize
                ${filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
              {f === 'medication' ? '💊' : f === 'appointment' ? '📅' : f === 'followup' ? '🔁' : ''} {f}
            </button>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">
              {editId ? '✏️ Edit Reminder' : '➕ New Reminder'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Metformin 500mg"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
                  <option value="medication">💊 Medication</option>
                  <option value="appointment">📅 Appointment</option>
                  <option value="followup">🔁 Follow-up</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Frequency</label>
                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Time</label>
                <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400">
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {(form.frequency === 'Once' || form.type === 'appointment') && (
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
              )}
              <div className={form.frequency === 'Once' || form.type === 'appointment' ? '' : 'col-span-2'}>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Notes</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
                {editId ? '✅ Update' : '➕ Add Reminder'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}
                className="border border-gray-200 text-gray-600 text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reminder Cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-gray-400 font-medium">No reminders found</p>
              <button onClick={() => setShowForm(true)}
                className="mt-4 bg-teal-600 text-white text-sm font-semibold px-5 py-2 rounded-xl">
                + Add First Reminder
              </button>
            </div>
          )}

          {filtered.map(r => {
            const typeConfig = REMINDER_TYPES[r.type] || REMINDER_TYPES.medication;
            return (
              <div key={r.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 transition-all ${!r.active ? 'opacity-50' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${typeConfig.color}`}>
                  {typeConfig.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-800">{r.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                    {!r.active && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">Paused</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>🕐 {r.time}</span>
                    <span>📆 {r.frequency}</span>
                    {r.date && <span>📅 {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    {r.notes && <span>📝 {r.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(r.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all
                      ${r.active ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                    {r.active ? '⏸ Pause' : '▶ Resume'}
                  </button>
                  <button onClick={() => handleEdit(r)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all">
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
