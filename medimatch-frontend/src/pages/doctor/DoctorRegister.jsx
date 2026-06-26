import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorRegister } from '../../services/authService';

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', gender: '',
    specialization: '', experience: '', consult_fee: '',
    hospital: '', license_no: '', languages: '',
    password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && (!form.full_name || !form.email || !form.phone)) {
      setError('Please fill all fields!'); return;
    }
    if (step === 2 && (!form.specialization || !form.hospital || !form.license_no)) {
      setError('Please fill all fields!'); return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters!'); return;
    }
    setLoading(true);
    try {
      const result = await doctorRegister({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        experience: form.experience,
        consult_fee: form.consult_fee,
        hospital: form.hospital,
        license_no: form.license_no,
        languages: form.languages,
        password: form.password,
      });
     if (result.message && (result.message.includes('successfully') || result.message.includes('verification'))) {
      } else {
        setError(result.message || 'Registration failed!');
      }
    } catch (err) {
      setError('Server error! Make sure backend is running.');
    }
    setLoading(false);
  };

  const specializations = ['Diabetologist','Cardiologist','Hematologist','Neurologist',
    'Orthopedic','Dermatologist','Psychiatrist','General Physician','Gynecologist',
    'Pediatrician','Ophthalmologist','ENT Specialist'];

  return (
    <div className="min-h-screen flex">
      <div className="w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-12 text-white">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mb-6">🏥</div>
        <h1 className="text-3xl font-bold mb-2">MediMatch</h1>
        <p className="text-blue-100 text-center text-sm mb-8 max-w-xs">Join our verified doctor network.</p>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-3">
          {[1,2,3].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step > s ? 'bg-white text-blue-600' : step === s ? 'bg-blue-400 text-white' : 'bg-blue-700 text-blue-300'}`}>
                {step > s ? '✓' : s}
              </div>
              {i < 2 && <div className={`w-12 h-1 rounded ${step > s ? 'bg-white' : 'bg-blue-700'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between w-48 text-xs text-blue-200 mb-8">
          <span>Personal</span><span>Professional</span><span>Security</span>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          {['Verified doctor badge','AI-assisted diagnosis','Secure patient data','Easy scheduling'].map(f => (
            <div key={f} className="bg-white bg-opacity-10 rounded-xl px-4 py-2 text-sm font-semibold">✅ {f}</div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/role')} className="text-blue-600 text-sm font-bold mb-6">← Change Role</button>

          <div className="text-2xl mb-1">👨‍⚕️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Doctor Registration</h2>
          <p className="text-gray-400 text-sm mb-6">
            {step === 1 ? 'Step 1 — Personal Details' : step === 2 ? 'Step 2 — Professional Details' : 'Step 3 — Set Password'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">⚠️ {error}</div>
          )}

          {step === 1 && (
            <>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Dr. Priya Sharma"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4"/>

              <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange}
                type="email" placeholder="doctor@hospital.com"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4"/>

              <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="+91 98765 00000"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-6"/>

              <button onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm">
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label className="block text-xs font-bold text-gray-500 mb-1">Specialization</label>
              <select name="specialization" value={form.specialization} onChange={handleChange}
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4 bg-white">
                <option value="">Select specialization</option>
                {specializations.map(s => <option key={s}>{s}</option>)}
              </select>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Experience (Years)</label>
                  <input name="experience" value={form.experience} onChange={handleChange}
                    type="number" placeholder="12"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"/>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Consult Fee (₹)</label>
                  <input name="consult_fee" value={form.consult_fee} onChange={handleChange}
                    type="number" placeholder="800"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400"/>
                </div>
              </div>

              <label className="block text-xs font-bold text-gray-500 mb-1">Hospital / Clinic</label>
              <input name="hospital" value={form.hospital} onChange={handleChange}
                placeholder="Apollo Hospital, Chennai"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4"/>

              <label className="block text-xs font-bold text-gray-500 mb-1">Medical License No.</label>
              <input name="license_no" value={form.license_no} onChange={handleChange}
                placeholder="MCI-TN-2014-04821"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4"/>

              <label className="block text-xs font-bold text-gray-500 mb-1">Languages Spoken</label>
              <input name="languages" value={form.languages} onChange={handleChange}
                placeholder="English, Tamil, Hindi"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-6"/>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm">← Back</button>
                <button onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm">Continue →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-xs text-blue-700">
                ℹ️ After registration, admin will verify your account before you can login.
              </div>

              <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
              <input name="password" value={form.password} onChange={handleChange}
                type="password" placeholder="Min 6 characters"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-4"/>

              <label className="block text-xs font-bold text-gray-500 mb-1">Confirm Password</label>
              <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                type="password" placeholder="Repeat password"
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 mb-6"/>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold text-sm">
                {loading ? '⏳ Registering...' : '✅ Complete Registration'}
              </button>
              <button onClick={() => setStep(2)}
                className="w-full mt-3 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm">← Back</button>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            Already registered? <span onClick={() => navigate('/doctor/login')} className="text-blue-600 font-bold cursor-pointer">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}