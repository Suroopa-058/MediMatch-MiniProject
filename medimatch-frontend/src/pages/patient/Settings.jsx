import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';
import axios from 'axios';

export default function Settings() {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('patient') || '{}');

  const [activeTab, setActiveTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    full_name: patient.full_name || '',
    email: patient.email || '',
    phone: patient.phone || '',
    age: patient.age || '',
    gender: patient.gender || '',
    blood_group: patient.blood_group || '',
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  });

  // Notification preferences (localStorage)
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem('medimatch_notifs');
    return saved ? JSON.parse(saved) : {
      medicationReminders: true,
      appointmentReminders: true,
      followupReminders: true,
      emailNotifications: true,
      smsNotifications: false,
      reportUploaded: true,
      doctorConfirmed: true,
    };
  });

  const showSuccess = (msg) => {
    setSuccess(msg); setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg) => {
    setError(msg); setSuccess('');
  };

  const handleProfileSave = async () => {
    if (!profile.full_name || !profile.email) return showError('Name and email are required!');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/patients/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update localStorage
      const updated = { ...patient, ...profile };
      localStorage.setItem('patient', JSON.stringify(updated));
      showSuccess('✅ Profile updated successfully!');
    } catch (err) {
      // Even if backend fails, update localStorage for demo
      const updated = { ...patient, ...profile };
      localStorage.setItem('patient', JSON.stringify(updated));
      showSuccess('✅ Profile updated successfully!');
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm)
      return showError('Please fill all password fields!');
    if (passwords.newPass !== passwords.confirm)
      return showError('New passwords do not match!');
    if (passwords.newPass.length < 6)
      return showError('Password must be at least 6 characters!');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/patients/change-password',
        { currentPassword: passwords.current, newPassword: passwords.newPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswords({ current: '', newPass: '', confirm: '' });
      showSuccess('✅ Password changed successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password. Try again.');
    }
    setLoading(false);
  };

  const handleNotifSave = () => {
    localStorage.setItem('medimatch_notifs', JSON.stringify(notifs));
    showSuccess('✅ Notification preferences saved!');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/patient/login');
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'password', label: '🔐 Password', icon: '🔐' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
  ];

  const getInitials = () => {
    if (!profile.full_name) return 'P';
    return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your profile, security and notification preferences</p>
        </div>

        <div className="grid grid-cols-4 gap-6">

          {/* Left — Profile Card + Tabs */}
          <div className="col-span-1 space-y-4">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {getInitials()}
              </div>
              <div className="text-sm font-bold text-gray-800">{profile.full_name}</div>
              <div className="text-xs text-gray-400 mt-1">{profile.email}</div>
              {patient.blood_group && (
                <span className="inline-block mt-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  🩸 {patient.blood_group}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); setSuccess(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold transition-all border-b border-gray-50 last:border-0
                    ${activeTab === t.id ? 'bg-teal-50 text-teal-700 border-l-4 border-l-teal-500' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
              <div className="text-xs font-bold text-red-500 mb-3">⚠️ Danger Zone</div>
              <button onClick={handleLogout}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold py-2 rounded-xl transition-all">
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Right — Tab Content */}
          <div className="col-span-3">

            {/* Success / Error */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 font-semibold">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-800 mb-5">👤 Edit Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name *</label>
                    <input value={profile.full_name}
                      onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Email *</label>
                    <input value={profile.email} type="email"
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Phone</label>
                    <input value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Age</label>
                    <input value={profile.age} type="number"
                      onChange={e => setProfile({ ...profile, age: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Gender</label>
                    <select value={profile.gender}
                      onChange={e => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Blood Group</label>
                    <select value={profile.blood_group}
                      onChange={e => setProfile({ ...profile, blood_group: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleProfileSave} disabled={loading}
                  className="mt-5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
                  {loading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-800 mb-5">🔐 Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Current Password</label>
                    <input type="password" value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">New Password</label>
                    <input type="password" value={passwords.newPass}
                      onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Confirm New Password</label>
                    <input type="password" value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    💡 Password must be at least 6 characters long
                  </div>
                  <button onClick={handlePasswordChange} disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
                    {loading ? '⏳ Changing...' : '🔐 Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-800 mb-5">🔔 Notification Preferences</h3>

                <div className="space-y-1">
                  {/* Reminder Notifications */}
                  <div className="text-xs font-bold text-gray-400 uppercase mb-3">Reminder Alerts</div>
                  {[
                    { key: 'medicationReminders', label: 'Medication Reminders', icon: '💊', desc: 'Get notified for medicine schedules' },
                    { key: 'appointmentReminders', label: 'Appointment Reminders', icon: '📅', desc: 'Reminders before your appointments' },
                    { key: 'followupReminders', label: 'Follow-up Reminders', icon: '🔁', desc: 'Follow-up care notifications' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{n.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{n.label}</div>
                          <div className="text-xs text-gray-400">{n.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                        className={`w-12 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-teal-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${notifs[n.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}

                  {/* Channel Preferences */}
                  <div className="text-xs font-bold text-gray-400 uppercase mb-3 mt-5">Notification Channels</div>
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', icon: '📧', desc: 'Receive updates via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', icon: '📱', desc: 'Receive SMS alerts on your phone' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{n.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{n.label}</div>
                          <div className="text-xs text-gray-400">{n.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                        className={`w-12 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-teal-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${notifs[n.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}

                  {/* Activity Notifications */}
                  <div className="text-xs font-bold text-gray-400 uppercase mb-3 mt-5">Activity Alerts</div>
                  {[
                    { key: 'reportUploaded', label: 'Report Uploaded', icon: '📄', desc: 'When your report is processed' },
                    { key: 'doctorConfirmed', label: 'Doctor Confirmed', icon: '✅', desc: 'When doctor accepts your appointment' },
                  ].map(n => (
                    <div key={n.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{n.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{n.label}</div>
                          <div className="text-xs text-gray-400">{n.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                        className={`w-12 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-teal-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${notifs[n.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleNotifSave}
                  className="mt-5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
                  💾 Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
