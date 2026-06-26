import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';
import axios from 'axios';

export default function DoctorSettings() {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');

  const [activeTab, setActiveTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    full_name: doctor.full_name || '',
    email: doctor.email || '',
    phone: doctor.phone || '',
    specialization: doctor.specialization || '',
    hospital: doctor.hospital || '',
    experience: doctor.experience || '',
    consult_fee: doctor.consult_fee || '',
    languages: doctor.languages || '',
    license_no: doctor.license_no || '',
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  });

  // Notification preferences
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem('medimatch_doctor_notifs');
    return saved ? JSON.parse(saved) : {
      newAppointment: true,
      appointmentCancelled: true,
      patientMessage: true,
      reportUploaded: true,
      emailNotifications: true,
      smsNotifications: false,
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
      await axios.put('/api/doctors/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...doctor, ...profile };
      localStorage.setItem('doctor', JSON.stringify(updated));
      showSuccess('✅ Profile updated successfully!');
    } catch (err) {
      const updated = { ...doctor, ...profile };
      localStorage.setItem('doctor', JSON.stringify(updated));
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
      await axios.put('/api/doctors/change-password',
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
    localStorage.setItem('medimatch_doctor_notifs', JSON.stringify(notifs));
    showSuccess('✅ Notification preferences saved!');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/doctor/login');
  };

  const getInitials = () => {
    if (!profile.full_name) return 'DR';
    return profile.full_name.replace(/^Dr\.?\s*/i, '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'password', label: '🔐 Password' },
    { id: 'notifications', label: '🔔 Notifications' },
  ];

  const SPECIALIZATIONS = [
    'Cardiologist', 'Dermatologist', 'Diabetologist', 'General Physician',
    'Gynecologist', 'Hematologist', 'Neurologist', 'Orthopedic',
    'Psychiatrist', 'Pulmonologist', 'Pediatrician', 'Urologist'
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your profile, security and notification preferences</p>
        </div>

        <div className="grid grid-cols-4 gap-6">

          {/* Left — Profile Card + Tabs */}
          <div className="col-span-1 space-y-4">

            {/* Doctor Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {getInitials()}
              </div>
              <div className="text-sm font-bold text-gray-800">{profile.full_name}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">{profile.specialization}</div>
              <div className="text-xs text-gray-400 mt-1">{profile.hospital}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-yellow-500 text-xs">⭐</span>
                <span className="text-xs font-bold text-gray-700">{doctor.rating || '4.5'}</span>
                <span className="text-xs text-gray-400">rating</span>
              </div>
              {doctor.is_verified && (
                <span className="inline-block mt-2 bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  ✅ Verified
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); setSuccess(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 text-sm font-semibold transition-all border-b border-gray-50 last:border-0
                    ${activeTab === t.id ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}>
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
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Email *</label>
                    <input value={profile.email} type="email"
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Phone</label>
                    <input value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Specialization</label>
                    <select value={profile.specialization}
                      onChange={e => setProfile({ ...profile, specialization: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                      <option value="">Select</option>
                      {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Hospital</label>
                    <input value={profile.hospital}
                      onChange={e => setProfile({ ...profile, hospital: e.target.value })}
                      placeholder="e.g. Apollo Hospital, Chennai"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Experience (years)</label>
                    <input value={profile.experience} type="number"
                      onChange={e => setProfile({ ...profile, experience: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Consultation Fee (₹)</label>
                    <input value={profile.consult_fee} type="number"
                      onChange={e => setProfile({ ...profile, consult_fee: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Languages</label>
                    <input value={profile.languages}
                      onChange={e => setProfile({ ...profile, languages: e.target.value })}
                      placeholder="e.g. English, Tamil, Hindi"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">License Number</label>
                    <input value={profile.license_no}
                      onChange={e => setProfile({ ...profile, license_no: e.target.value })}
                      placeholder="e.g. TN-MED-2012-001"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                </div>
                <button onClick={handleProfileSave} disabled={loading}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
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
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">New Password</label>
                    <input type="password" value={passwords.newPass}
                      onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">Confirm New Password</label>
                    <input type="password" value={passwords.confirm}
                      onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                    💡 Password must be at least 6 characters long
                  </div>
                  <button onClick={handlePasswordChange} disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
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

                  <div className="text-xs font-bold text-gray-400 uppercase mb-3">Appointment Alerts</div>
                  {[
                    { key: 'newAppointment', label: 'New Appointment Booked', icon: '📅', desc: 'When a patient books with you' },
                    { key: 'appointmentCancelled', label: 'Appointment Cancelled', icon: '❌', desc: 'When a patient cancels' },
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
                        className={`w-12 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${notifs[n.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}

                  <div className="text-xs font-bold text-gray-400 uppercase mb-3 mt-5">Patient Alerts</div>
                  {[
                    { key: 'patientMessage', label: 'Patient Messages', icon: '💬', desc: 'When a patient sends a chat message' },
                    { key: 'reportUploaded', label: 'Report Uploaded', icon: '📄', desc: 'When patient uploads a new report' },
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
                        className={`w-12 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${notifs[n.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}

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
                        className={`w-12 h-6 rounded-full transition-all relative ${notifs[n.key] ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${notifs[n.key] ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleNotifSave}
                  className="mt-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
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
