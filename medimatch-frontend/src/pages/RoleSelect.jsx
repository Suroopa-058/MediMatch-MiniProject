import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      icon: '🧑‍💼',
      title: 'Patient',
      desc: 'Find labs, upload reports, get AI diagnosis & book doctors easily',
      borderColor: 'border-teal-200 hover:border-teal-500',
      badgeBg: 'bg-teal-100 text-teal-700',
      btnPrimary: 'bg-teal-600 hover:bg-teal-700',
      hoverBg: 'hover:bg-teal-50',
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor',
      desc: 'Manage appointments, consult patients & view health records',
      borderColor: 'border-blue-200 hover:border-blue-500',
      badgeBg: 'bg-blue-100 text-blue-700',
      btnPrimary: 'bg-blue-600 hover:bg-blue-700',
      hoverBg: 'hover:bg-blue-50',
    },
    {
      icon: '🧪',
      title: 'Lab',
      desc: 'Search patients and upload their lab reports securely',
      borderColor: 'border-indigo-200 hover:border-indigo-500',
      badgeBg: 'bg-indigo-100 text-indigo-700',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700',
      hoverBg: 'hover:bg-indigo-50',
    },
    {
      icon: '🔧',
      title: 'Admin',
      desc: 'Manage platform, approve doctors & monitor system activity',
      borderColor: 'border-purple-200 hover:border-purple-500',
      badgeBg: 'bg-purple-100 text-purple-700',
      btnPrimary: 'bg-purple-600 hover:bg-purple-700',
      hoverBg: 'hover:bg-purple-50',
    },
  ];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-white px-8">

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-8 text-sm text-teal-600 font-semibold hover:underline"
      >
        ← Back to Home
      </button>

      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🏥</div>
        <h2 className="text-3xl font-extrabold text-gray-800">Who are you?</h2>
        <p className="text-gray-400 mt-2 text-sm">Select your role to continue to MediMatch</p>
      </div>

      <div className="flex gap-6 flex-wrap justify-center">
        {roles.map((role) => (
          <div
            key={role.title}
            className={`bg-white rounded-2xl border-2 ${role.borderColor} ${role.hoverBg} p-8 w-60 text-center cursor-pointer transition-all shadow-sm hover:shadow-lg`}
          >
            <div className="text-5xl mb-4">{role.icon}</div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${role.badgeBg}`}>
              {role.title}
            </span>
            <p className="text-gray-400 text-xs mt-3 mb-6 leading-relaxed">{role.desc}</p>

            <button
             onClick={() => {
  if (role.title === 'Patient') navigate('/patient/login');
  else if (role.title === 'Doctor') navigate('/doctor/login');
  else if (role.title === 'Lab') navigate('/lab/login');
  else navigate('/admin/login');
}}
              className={`w-full ${role.btnPrimary} text-white py-2 rounded-lg text-sm font-bold mb-2 transition-all`}
            >
              Login as {role.title}
            </button>

            {role.title !== 'Admin' && (
              <button
                onClick={() => {
  if (role.title === 'Patient') navigate('/patient/register');
  else if (role.title === 'Lab') navigate('/lab/register');
  else navigate('/doctor/register');
}}
                className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Register
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
