import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { labLogin } from '../../services/labAuthService';

export default function LabLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please enter email and password!');
      return;
    }
    setLoading(true);
    try {
      const result = await labLogin(form);
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('lab', JSON.stringify(result.lab));
        localStorage.setItem('role', 'lab');
        navigate('/lab/dashboard');
      } else {
        setError(result.message || 'Login failed!');
      }
    } catch (err) {
      setError('Server error! Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-5/12 bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6">🧪</div>
        <h1 className="text-3xl font-bold mb-2">MediMatch</h1>
        <p className="text-indigo-100 text-center text-sm mb-8 max-w-xs">
          Upload patient reports directly and securely — no paperwork, no delays.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          {['Search Patients Instantly', 'Upload Reports Securely', 'Linked to Patient Records', 'Trusted Lab Network'].map(f => (
            <div key={f} className="bg-white bg-opacity-10 rounded-xl px-4 py-2 text-sm font-semibold">
              ✅ {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/role')} className="text-indigo-600 text-sm font-bold mb-6">
            ← Change Role
          </button>

          <div className="text-2xl mb-1">🧪</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Lab Login</h2>
          <p className="text-gray-400 text-sm mb-6">Login to your lab account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
          <input name="email" value={form.email} onChange={handleChange}
            type="email" placeholder="lab@citydiagnostics.com"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 mb-4" />

          <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
          <input name="password" value={form.password} onChange={handleChange}
            type="password" placeholder="••••••••"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 mb-6"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl font-bold text-sm transition-all">
            {loading ? '⏳ Logging in...' : 'Login as Lab'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{' '}
            <span onClick={() => navigate('/lab/register')} className="text-indigo-600 font-bold cursor-pointer">
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
