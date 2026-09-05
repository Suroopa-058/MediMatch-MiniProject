import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Logo';

export default function PatientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: '🏠', label: 'Dashboard',       path: '/patient/dashboard' },
    { icon: '🧪', label: 'Find Lab',         path: '/patient/lab-finder' },
    { icon: '📄', label: 'Upload Report',    path: '/patient/report-upload' },
    { icon: '🧬', label: 'AI Analysis',      path: '/patient/ai-analysis' },
    { icon: '💊', label: 'Medicine Scanner', path: '/patient/medicine-scan' },
    { icon: '🧪', label: 'Reports from Lab', path: '/patient/lab-reports' },
    { icon: '👨‍⚕️', label: 'Find Doctor',    path: '/patient/doctor-swipe' },
    { icon: '✅', label: 'Confirm Booking',  path: '/patient/otp-confirm' },
    { icon: '🎥', label: 'Video Consult',    path: '/patient/video-consult' },
    { icon: '📊', label: 'Health Dashboard', path: '/patient/health-dashboard' },
    
  ];

  const bottomItems = [
    { icon: '🔔', label: 'Reminders',  path: '/patient/reminders' },
    { icon: '⚙️', label: 'Settings',   path: '/patient/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <Logo size={32} />
        <span className="text-base font-bold text-teal-700">MediMatch</span>
      </div>

      {/* Patient Badge */}
      <div className="mx-3 mt-3 mb-2 bg-teal-50 rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800">Suroopa</div>
          <div className="text-xs text-teal-600 font-medium">Patient</div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="text-xs font-bold text-gray-400 px-2 mb-2 mt-1">MAIN MENU</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all text-sm font-medium
                ${isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
          );
        })}

        <div className="text-xs font-bold text-gray-400 px-2 mb-2 mt-4">OTHER</div>
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all text-sm font-medium
                ${isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
        >
          <span>🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
}