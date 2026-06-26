import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('user', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error! Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="w-5/12 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6">⚙️</div>
        <h1 className="text-3xl font-bold mb-2">MediMatch</h1>
        <p className="text-gray-300 text-center text-sm mb-8">Admin Control Panel</p>
        <div className="space-y-3 w-full max-w-xs">
          {['Manage Doctors', 'Verify Registrations', 'View All Patients', 'Platform Analytics'].map(f => (
            <div key={f} className="bg-white bg-opacity-10 rounded-xl px-4 py-2 text-sm font-semibold">✅ {f}</div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/role')} className="text-gray-500 text-sm font-bold mb-6">← Back</button>
          <div className="text-2xl mb-1">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Admin Login</h2>
          <p className="text-gray-400 text-sm mb-6">Access the admin control panel</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">⚠️ {error}</div>
          )}

          <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="admin@medimatch.com"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 mb-4" />

          <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)}
            type="password" placeholder="Enter password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 mb-6" />

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-sm">
            {loading ? '⏳ Logging in...' : '🔐 Login as Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}