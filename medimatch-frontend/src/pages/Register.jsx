import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const roleConfig = {
    patient: { icon: '🧑‍💼', label: 'Patient', btn: 'bg-teal-600 hover:bg-teal-700', ring: 'focus:border-teal-400' },
    doctor: { icon: '👨‍⚕️', label: 'Doctor', btn: 'bg-blue-600 hover:bg-blue-700', ring: 'focus:border-blue-400' },
  };

  const r = roleConfig[role] || roleConfig.patient;

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 flex flex-col items-center justify-center px-16 text-white">
        <Logo size={72} />
        <h1 className="text-4xl font-bold mb-3 mt-5">MediMatch</h1>
        <p className="text-teal-100 text-center text-sm leading-relaxed max-w-xs">
          Join thousands already using MediMatch for smarter healthcare.
        </p>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-white px-16">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/role')} className="text-sm text-teal-600 font-semibold hover:underline mb-6">
            ← Change Role
          </button>
          <div className="text-3xl mb-1">{r.icon}</div>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1 mb-6">Register as a {r.label}</p>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none ${r.ring}`} />
            <input type="email" placeholder="Email Address" className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none ${r.ring}`} />
            <input type="tel" placeholder="+91 98765 43210" className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none ${r.ring}`} />
            <input type="password" placeholder="Password" className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none ${r.ring}`} />
            <input type="password" placeholder="Confirm Password" className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none ${r.ring}`} />
            <button className={`w-full ${r.btn} text-white py-3 rounded-xl font-bold text-sm`}>
              Create {r.label} Account
            </button>
            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <span onClick={() => navigate(`/login?role=${role}`)} className="text-teal-600 font-bold cursor-pointer hover:underline">Login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}