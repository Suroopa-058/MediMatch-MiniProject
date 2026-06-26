import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Logo({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="bgGL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="ecgGL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="200" rx="44" fill="url(#bgGL)" />
      <path d="M32,22 L22,22 L22,32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M168,22 L178,22 L178,32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M32,178 L22,178 L22,168" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M168,178 L178,178 L178,168" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <rect x="76" y="38" width="48" height="124" rx="14" fill="white" />
      <rect x="38" y="76" width="124" height="48" rx="14" fill="white" />
      <polyline points="30,100 55,100 65,70 78,130 90,88 102,112 114,78 126,122 138,100 170,100"
        fill="none" stroke="url(#ecgGL)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="100" r="7" fill="white" />
      <circle cx="170" cy="100" r="7" fill="white" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const roleConfig = {
    patient: {
      icon: '🧑‍💼', label: 'Patient',
      btn: 'bg-teal-600 hover:bg-teal-700',
      ring: 'focus:border-teal-500',
      accent: 'text-teal-600',
    },
    doctor: {
      icon: '👨‍⚕️', label: 'Doctor',
      btn: 'bg-blue-600 hover:bg-blue-700',
      ring: 'focus:border-blue-500',
      accent: 'text-blue-600',
    },
    admin: {
      icon: '🔧', label: 'Admin',
      btn: 'bg-purple-600 hover:bg-purple-700',
      ring: 'focus:border-purple-500',
      accent: 'text-purple-600',
    },
  };

  const r = roleConfig[role];

  const features = [
    '🧬 AI Report Analysis',
    '📍 Smart Lab Finder',
    '🩺 Doctor Swipe Selection',
    '🎥 Video Consultation',
  ];

  return (
    <div className="h-screen flex overflow-hidden">

      {/* Left Panel */}
      <div className="w-5/12 bg-gradient-to-br from-teal-600 to-teal-900 flex flex-col items-center justify-center px-14 text-white">
        <Logo size={72} />
        <h1 className="text-4xl font-extrabold mt-5 mb-2">MediMatch</h1>
        <p className="text-teal-100 text-sm text-center leading-relaxed max-w-xs mb-10">
          AI-powered healthcare — from lab report to specialist consultation, all in one platform.
        </p>
        <div className="w-full max-w-xs space-y-3">
          {features.map(f => (
            <div key={f} className="flex items-center gap-3 bg-white bg-opacity-10 backdrop-blur rounded-xl px-4 py-3 text-sm font-medium">
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-16">
        <div className="w-full max-w-md">

          {/* Back */}
          <button
            onClick={() => navigate('/role')}
            className="text-sm text-teal-600 font-semibold hover:underline mb-8 flex items-center gap-1"
          >
            ← Change Role
          </button>

          {/* Header */}
          <div className="text-3xl mb-2">{r.icon}</div>
          <h2 className="text-2xl font-extrabold text-gray-800">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1 mb-8">Login to your {r.label} account</p>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition-all ${r.ring} focus:border-2`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none transition-all ${r.ring} focus:border-2`}
              />
            </div>

            <div className="text-right">
              <span className={`text-xs font-semibold cursor-pointer hover:underline ${r.accent}`}>
                Forgot Password?
              </span>
            </div>

            <button className={`w-full ${r.btn} text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg`}>
              Login as {r.label}
            </button>

            {role !== 'admin' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <button className="w-full border border-gray-200 hover:bg-gray-50 py-3 rounded-xl text-sm font-semibold text-gray-600 flex items-center justify-center gap-2 transition-all">
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7l-6.6 4.8C9.7 39.6 16.3 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <span
                    onClick={() => navigate(`/register?role=${role}`)}
                    className={`font-bold cursor-pointer hover:underline ${r.accent}`}
                  >
                    Sign Up
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}