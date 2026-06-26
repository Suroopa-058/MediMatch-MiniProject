import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

export default function OTPConfirm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get appointment data passed from booking page
 const { appointmentId: apptIdFromState, doctorName, doctorSpec, hospital, date, time, fee } = location.state || {};
const appointmentId = apptIdFromState || sessionStorage.getItem('appointmentId');

// Save it when it first arrives
if (apptIdFromState) {
  sessionStorage.setItem('appointmentId', apptIdFromState);
}

  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState('pending');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  

  useEffect(() => {
    if (step !== 'otpSent') return;
    if (timer === 0) return;
    const t = setInterval(() => setTimer(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, timer]);

  // Poll for doctor confirmation every 5 seconds
  useEffect(() => {
    if (step !== 'verified') return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/appointments/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const appt = data.find(a => a.id === appointmentId);
        if (appt && appt.status === 'confirmed') {
          clearInterval(interval);
          setStep('doctorConfirmed');
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, appointmentId]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOTP = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otpSent');
      setTimer(60);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    const entered = otp.join('');
    if (entered.length < 4) { setError('Please enter all 4 digits'); return; }
    if (entered !== '1234') { setError('Invalid OTP. Try 1234 for demo'); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/appointments/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ appointment_id: appointmentId, otp: entered })
      });

      const data = await res.json();
      if (res.ok) {
        setLoading(false);
        setStep('verified');
      } else {
        setError(data.message || 'Verification failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Server error. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">✅ Confirm Booking</h2>
          <p className="text-gray-400 text-sm mt-1">Double-opt confirmation — both you and the doctor must confirm</p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'You Confirm',      icon: '🧑‍💼', desc: 'Enter OTP sent to your phone' },
              { step: 2, label: 'Doctor Confirms',   icon: '👨‍⚕️', desc: 'Doctor accepts your request' },
              { step: 3, label: 'Booking Confirmed', icon: '✅',   desc: 'Appointment is locked in' },
            ].map((s, i) => {
              const done = step === 'doctorConfirmed' ? true :
                           step === 'verified' ? s.step <= 1 :
                           step === 'otpSent'  ? s.step <= 1 : false;
              const active = step === 'pending'         ? s.step === 1 :
                             step === 'otpSent'         ? s.step === 1 :
                             step === 'verified'        ? s.step === 2 :
                             step === 'doctorConfirmed' ? s.step === 3 : false;
              return (
                <React.Fragment key={s.step}>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all
                      ${done ? 'bg-teal-600 text-white shadow-lg' :
                        active ? 'bg-teal-100 text-teal-700 animate-pulse' :
                        'bg-gray-100 text-gray-400'}`}>
                      {done ? '✓' : s.icon}
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-bold ${done || active ? 'text-teal-700' : 'text-gray-400'}`}>{s.label}</div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                    </div>
                  </div>
                  {i < 2 && <div className={`h-1 w-16 rounded transition-all ${done && s.step < 3 ? 'bg-teal-500' : 'bg-gray-100'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Appointment Summary</h3>
              <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl mb-4">
                <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl">👩‍⚕️</div>
                <div>
                  <div className="text-base font-bold text-gray-800">{doctorName || 'Dr. Priya Sharma'}</div>
                  <div className="text-sm text-teal-600 font-medium">{doctorSpec || 'Diabetologist'}</div>
                  <div className="text-xs text-gray-500">{hospital || 'Apollo Hospital, Chennai'}</div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { icon: '📅', label: 'Date', value: date || 'Mar 21, 2026' },
                  { icon: '🕐', label: 'Time', value: time || '10:00 AM' },
                  { icon: '💊', label: 'Type', value: 'Video Consultation' },
                  { icon: '💰', label: 'Fee',  value: fee ? `₹${fee}` : '₹800' },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{d.icon} {d.label}</span>
                    <span className="font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Doctor Confirmation Status</h3>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${step === 'doctorConfirmed' ? 'bg-green-50' : 'bg-orange-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${step === 'doctorConfirmed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {step === 'doctorConfirmed' ? '✅' : '⏳'}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{doctorName || 'Dr. Priya Sharma'}</div>
                  <div className={`text-xs font-medium ${step === 'doctorConfirmed' ? 'text-green-600' : 'text-orange-500'}`}>
                    {step === 'doctorConfirmed' ? 'Confirmed your appointment ✓' : 'Waiting for doctor confirmation...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            {step === 'doctorConfirmed' && (
              <div className="bg-white rounded-2xl p-8 border border-green-200 shadow-sm text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500 mb-6">Your appointment is confirmed. Join the video call at the scheduled time.</p>
                <button onClick={() => {
  // alert('appointmentId is: ' + appointmentId);
  navigate(`/patient/video-consult/${appointmentId}`);
}}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm mb-3">
                  🎥 Join Video Consultation
                </button>
                <button onClick={() => navigate('/patient/dashboard')}
                  className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold">
                  Back to Dashboard
                </button>
              </div>
            )}

            {step === 'verified' && (
              <div className="bg-white rounded-2xl p-8 border border-teal-200 shadow-sm text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⏳</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">OTP Verified!</h3>
                <p className="text-sm text-gray-500 mb-4">Waiting for the doctor to confirm your appointment...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                </div>
                <p className="text-xs text-gray-400 mt-4">Auto-updates when doctor confirms</p>
              </div>
            )}

            {step === 'otpSent' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-1">Enter OTP</h3>
                <p className="text-xs text-gray-400 mb-6">Demo OTP: <span className="text-teal-600 font-bold">1234</span></p>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2 rounded-xl mb-4">⚠️ {error}</div>}
                <div className="flex gap-3 justify-center mb-6">
                  {otp.map((digit, i) => (
                    <input key={i} ref={el => inputRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 transition-all"
                    />
                  ))}
                </div>
                <button onClick={handleVerifyOTP} disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white py-3 rounded-xl font-bold text-sm mb-3">
                  {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
                </button>
                <div className="text-center text-xs text-gray-400">
                  {timer > 0 ? <span>Resend in <span className="text-teal-600 font-bold">{timer}s</span></span>
                    : <button onClick={() => setTimer(60)} className="text-teal-600 font-bold">Resend OTP</button>}
                </div>
              </div>
            )}

            {step === 'pending' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 mb-2">Confirm Your Booking</h3>
                <p className="text-sm text-gray-500 mb-6">We'll send a 4-digit OTP to confirm this appointment.</p>
                <div className="bg-teal-50 rounded-xl p-4 mb-6">
                  <div className="text-xs text-gray-500 mb-1">Sending OTP to</div>
                  <div className="text-sm font-bold text-gray-800">+91 98765 XXXXX</div>
                </div>
                <button onClick={handleSendOTP} disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white py-3 rounded-xl font-bold text-sm">
                  {loading ? '⏳ Sending...' : '📱 Send OTP'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}