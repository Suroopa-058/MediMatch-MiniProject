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

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-12 py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <span className="text-xl font-bold text-teal-700">MediMatch</span>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-600 font-medium">
          <span onClick={() => scrollTo('home')} className="hover:text-teal-600 cursor-pointer">Home</span>
          <span onClick={() => scrollTo('about')} className="hover:text-teal-600 cursor-pointer">About</span>
          <span onClick={() => scrollTo('services')} className="hover:text-teal-600 cursor-pointer">Services</span>
          <span onClick={() => scrollTo('contact')} className="hover:text-teal-600 cursor-pointer">Contact</span>
        </div>
        <button onClick={() => navigate('/role')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all">
          Log In
        </button>
      </nav>

      {/* Hero Section */}
      <section id="home" className="flex-1 flex items-center bg-gradient-to-br from-teal-50 via-blue-50 to-white px-20 py-20">
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
            <button onClick={() => navigate('/role')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all">
              Get Started →
            </button>
            <button onClick={() => scrollTo('about')}
              className="border-2 border-teal-300 text-teal-700 hover:bg-teal-50 px-8 py-3 rounded-xl font-semibold text-sm transition-all">
              Learn More
            </button>
          </div>
          <div className="flex items-center gap-0">
            <div className="pr-8">
              <div className="text-3xl font-extrabold text-teal-700">10K+</div>
              <div className="text-xs text-gray-400 mt-1">Patients Served</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="px-8">
              <div className="text-3xl font-extrabold text-teal-700">500+</div>
              <div className="text-xs text-gray-400 mt-1">Verified Doctors</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="pl-8">
              <div className="text-3xl font-extrabold text-teal-700">98%</div>
              <div className="text-xs text-gray-400 mt-1">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <div className="relative flex items-center justify-center" style={{ width: '420px', height: '420px' }}>
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-teal-300 opacity-50"
              style={{ animation: 'spin 25s linear infinite' }} />
            <div className="flex flex-col items-center gap-4 z-10">
              <Logo size={110} />
              <div className="flex gap-3">
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-teal-700 border border-teal-100">🧬 AI Analysis</span>
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-blue-700 border border-blue-100">📍 Lab Finder</span>
              </div>
              <div className="flex gap-3">
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-purple-700 border border-purple-100">🎥 Video Consult</span>
                <span className="bg-white rounded-xl shadow-md px-4 py-2 text-xs font-semibold text-orange-700 border border-orange-100">⚡ Urgency Priority</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-20 bg-white">
        <div className="text-center mb-12">
          <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">About Us</span>
          <h2 className="text-4xl font-extrabold text-gray-800 mt-4 mb-4">What is MediMatch?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
            MediMatch is an AI-powered healthcare platform that bridges the gap between patients, labs, and doctors.
            We make healthcare accessible, intelligent, and instant — from anywhere.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[
            { icon: '🧬', title: 'AI-Powered Analysis', desc: 'Upload your medical reports and get instant AI-driven insights, anomaly detection, and urgency assessment.' },
            { icon: '👨‍⚕️', title: 'Verified Doctors', desc: 'Connect with specialist doctors verified by our platform. Book appointments and consult via video call.' },
            { icon: '🔬', title: 'Lab Finder', desc: 'Locate certified diagnostic labs near you using GPS. Get directions and available tests instantly.' },
          ].map(item => (
            <div key={item.title} className="bg-teal-50 rounded-2xl p-8 text-center border border-teal-100">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-20 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center mb-12">
          <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">Our Services</span>
          <h2 className="text-4xl font-extrabold text-gray-800 mt-4 mb-4">Everything You Need</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">Complete healthcare ecosystem in one platform</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '📄', title: 'Report Upload', desc: 'Upload blood tests, X-rays, MRI, ECG and more for AI analysis.' },
            { icon: '🎥', title: 'Video Consultation', desc: 'Join real-time video calls with your doctor from anywhere.' },
            { icon: '📍', title: 'Find Nearby Lab', desc: 'Locate real diagnostic labs near you using OpenStreetMap.' },
            { icon: '💊', title: 'Digital Prescriptions', desc: 'Receive and store digital prescriptions from your doctors.' },
            { icon: '📊', title: 'Health Dashboard', desc: 'Track your complete health history, vitals, and reports.' },
            { icon: '🔔', title: 'Smart Reminders', desc: 'Get medication and appointment reminders automatically.' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-teal-200 transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-20 bg-white">
        <div className="text-center mb-12">
          <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">Contact Us</span>
          <h2 className="text-4xl font-extrabold text-gray-800 mt-4 mb-4">Get In Touch</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">Have questions? We're here to help!</p>
        </div>
        <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: '📧', title: 'Email', value: 'support@medimatch.com' },
            { icon: '📞', title: 'Phone', value: '+91 98765 43210' },
            { icon: '📍', title: 'Location', value: 'Coimbatore, Tamil Nadu' },
          ].map(item => (
            <div key={item.title} className="text-center bg-teal-50 rounded-2xl p-8 border border-teal-100">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-base font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-teal-600 text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-12 max-w-3xl mx-auto">
          <h3 className="text-3xl font-extrabold text-white mb-4">Ready to get started?</h3>
          <p className="text-teal-100 mb-8 text-sm">Join thousands of patients already using MediMatch</p>
          <button onClick={() => navigate('/role')}
            className="bg-white text-teal-700 hover:bg-teal-50 px-10 py-3 rounded-xl font-bold text-sm transition-all shadow-lg">
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>© 2026 MediMatch. All rights reserved. Built with ❤️ for better healthcare.</p>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}