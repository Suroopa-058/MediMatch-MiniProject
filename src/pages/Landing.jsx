import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logo({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="ecgG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="200" rx="44" fill="url(#bgG)" />
      <path d="M32,22 L22,22 L22,32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M168,22 L178,22 L178,32" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M32,178 L22,178 L22,168" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <path d="M168,178 L178,178 L178,168" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" />
      <rect x="76" y="38" width="48" height="124" rx="14" fill="white" />
      <rect x="38" y="76" width="124" height="48" rx="14" fill="white" />
      <polyline points="30,100 55,100 65,70 78,130 90,88 102,112 114,78 126,122 138,100 170,100"
        fill="none" stroke="url(#ecgG)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="100" r="7" fill="white" />
      <circle cx="170" cy="100" r="7" fill="white" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hiddenmin-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <span className="text-xl font-bold text-teal-700">MediMatch</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-600 font-medium">
          <span className="hover:text-teal-600 cursor-pointer">Home</span>
          <span className="hover:text-teal-600 cursor-pointer">About</span>
          <span className="hover:text-teal-600 cursor-pointer">Services</span>
          <span className="hover:text-teal-600 cursor-pointer">Contact</span>
        </div>
        <button
          onClick={() => navigate('/role')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all"
        >
          Log In
        </button>
      </nav>

      {/* Hero — fills remaining height */}
      <div className="flex-1 flex items-center bg-gradient-to-br from-teal-50 via-blue-50 to-white px-20 py-0lex-1 flex items-center bg-gradient-to-br from-teal-50 via-blue-50 to-white px-20">

        {/* Left */}
        <div className="flex-1 max-w-xl">
          <span className="inline-block bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            ✨ AI-Powered Healthcare Platform
          </span>
          <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-4">
            Welcome to <br />
            <span className="text-teal-600">MediMatch</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
            From lab testing to specialist consultation — all in one place.
            Upload reports, get AI diagnosis, and connect with the right doctor instantly.
          </p>

          <div className="flex gap-4 mb-12">
            <button
              onClick={() => navigate('/role')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all"
            >
              Get Started →
            </button>
            <button className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 px-8 py-3 rounded-xl font-semibold text-sm transition-all">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-0">
            <div className="pr-8">
              <div className="text-3xl font-extrabold text-teal-700">10K+</div>
              <div className="text-xs text-gray-400 mt-1">Patients Served</div>
            </div>
            <div className="w-px h-12 bg-gray-200 mx-0" />
            <div className="px-8">
              <div className="text-3xl font-extrabold text-teal-700">500+</div>
              <div className="text-xs text-gray-400 mt-1">Verified Doctors</div>
            </div>
            <div className="w-px h-12 bg-gray-200 mx-0" />
            <div className="pl-8">
              <div className="text-3xl font-extrabold text-teal-700">98%</div>
              <div className="text-xs text-gray-400 mt-1">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Right — Spinning circle */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative flex items-center justify-center" style={{ width: '420px', height: '420px' }}>
            {/* Dashed spinning ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-dashed border-teal-300 opacity-50"
              style={{ animation: 'spin 25s linear infinite' }}
            />
            {/* Content */}
            <div className="flex flex-col items-center gap-4 z-10">
              <Logo size={110} />
              <div className="flex gap-3">
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-teal-700 border border-teal-100">
                  🧬 AI Analysis
                </span>
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-blue-700 border border-blue-100">
                  📍 Lab Finder
                </span>
              </div>
              <div className="flex gap-3">
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-purple-700 border border-purple-100">
                  🎥 Video Consult
                </span>
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-orange-700 border border-orange-100">
                  ⚡ Urgency Priority
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}