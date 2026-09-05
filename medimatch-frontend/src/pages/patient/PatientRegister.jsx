import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientRegister } from '../../services/authService';

export default function PatientRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    age: '', gender: '', blood_group: '',
    password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (!form.full_name || !form.email || !form.phone) {
      setError('Please fill all fields!');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    try {
      const result = await patientRegister({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        blood_group: form.blood_group,
        password: form.password,
      });

      if (result.message && result.message.includes('successfully')) {
        navigate('/verify-otp', { state: { email: form.email, role: 'patient' } });
      } else {
        setError(result.message || 'Registration failed!');
      }
    } catch (err) {
      setError('Server error! Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-5/12 bg-gradient-to-br from-teal-500 to-teal-700 flex flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6">🏥</div>
        <h1 className="text-3xl font-bold mb-2">MediMatch</h1>
        <p className="text-teal-100 text-center text-sm mb-8 max-w-xs">
          Your AI-powered health companion for smarter medical care.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-white text-teal-600' : 'bg-teal-600 text-white'}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`w-16 h-1 rounded ${step > 1 ? 'bg-white' : 'bg-teal-600'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-white text-teal-600' : 'bg-teal-600 text-white'}`}>
            2
          </div>
        </div>
        <div className="flex justify-between w-36 text-xs text-teal-200">
          <span>Personal</span>
          <span>Security</span>
        </div>

        <div className="mt-8 space-y-3 w-full max-w-xs">
          {['AI Report Analysis', 'Find Best Doctors', 'Video Consultations', 'Health Dashboard'].map(f => (
            <div key={f} className="bg-white bg-opacity-10 rounded-xl px-4 py-2 text-sm font-semibold">
              ✅ {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/role')} className="text-teal-600 text-sm font-bold mb-6 flex items-center gap-1">
            ← Change Role
          </button>

          <div className="text-2xl mb-1">🧑‍⚕️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">
            {step === 1 ? 'Step 1 — Personal Details' : 'Step 2 — Set Password'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Suroopa"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 mb-4" />

              <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange}
                type="email" placeholder="sneka@gmail.com"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 mb-4" />

              <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 mb-4" />

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Age</label>
                  <input name="age" value={form.age} onChange={handleChange}
                    type="number" placeholder="24"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 bg-white">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Blood Group</label>
                  <select name="blood_group" value={form.blood_group} onChange={handleChange}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 bg-white">
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleNext}
                className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm transition-all">
                Continue →
              </button>
            </>
          ) : (
            <>
              <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
              <input name="password" value={form.password} onChange={handleChange}
                type="password" placeholder="Min 6 characters"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 mb-4" />

              <label className="block text-xs font-bold text-gray-500 mb-1">Confirm Password</label>
              <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                type="password" placeholder="Repeat password"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 mb-6" />

              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white py-3 rounded-xl font-bold text-sm transition-all">
                {loading ? '⏳ Creating Account...' : '✅ Create Account'}
              </button>

              <button onClick={() => setStep(1)}
                className="w-full mt-3 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm">
                ← Back
              </button>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{' '}
            <span onClick={() => navigate('/patient/login')} className="text-teal-600 font-bold cursor-pointer">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}