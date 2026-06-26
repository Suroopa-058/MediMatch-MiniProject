import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Logo';

export default function DoctorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: '🏠', label: 'Dashboard',         path: '/doctor/dashboard' },
    { icon: '📋', label: 'Appointment Requests', path: '/doctor/appointments' },
    { icon: '📄', label: 'Patient Reports',    path: '/doctor/patient-report' },
    { icon: '🎥', label: 'Video Consult',      path: '/doctor/video-consult' },
    { icon: '💊', label: 'Prescriptions',      path: '/doctor/prescription' },
  ];

  const bottomItems = [
    { icon: '⚙️', label: 'Settings', path: '/doctor/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <Logo size={32} />
        <span className="text-base font-bold text-blue-700">MediMatch</span>
      </div>

      {/* Doctor Badge */}
      <div className="mx-3 mt-3 mb-2 bg-blue-50 rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          P
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800">Dr. Priya Sharma</div>
          <div className="text-xs text-blue-600 font-medium">Diabetologist</div>
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
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
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
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
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