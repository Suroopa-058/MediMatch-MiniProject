import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorLogin } from '../../services/authService';

export default function DoctorLogin() {
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
      const result = await doctorLogin(form);
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('doctor', JSON.stringify(result.doctor));
        localStorage.setItem('role', 'doctor');
        navigate('/doctor/dashboard');
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
      <div className="w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6">🏥</div>
        <h1 className="text-3xl font-bold mb-2">MediMatch</h1>
        <p className="text-blue-100 text-center text-sm mb-8 max-w-xs">
          Manage your patients, appointments and consultations — all in one place.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          {['Manage Appointments', 'View Patient Reports', 'AI-Powered Insights', 'Video Consultations'].map(f => (
            <div key={f} className="bg-white bg-opacity-10 rounded-xl px-4 py-2 text-sm font-semibold">
              ✅ {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/role')} className="text-blue-600 text-sm font-bold mb-6">
            ← Change Role
          </button>

          <div className="text-2xl mb-1">👨‍⚕️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Doctor Login</h2>
          <p className="text-gray-400 text-sm mb-6">Login to your doctor account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
          <input name="email" value={form.email} onChange={handleChange}
            type="email" placeholder="doctor@hospital.com"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4" />

          <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
          <input name="password" value={form.password} onChange={handleChange}
            type="password" placeholder="••••••••"
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-2"
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />

          <div className="text-right mb-6">
            <span className="text-blue-600 text-xs font-bold cursor-pointer">Forgot Password?</span>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold text-sm transition-all">
            {loading ? '⏳ Logging in...' : 'Login as Doctor'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{' '}
            <span onClick={() => navigate('/doctor/register')} className="text-blue-600 font-bold cursor-pointer">
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}