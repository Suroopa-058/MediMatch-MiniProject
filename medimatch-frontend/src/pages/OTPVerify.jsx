import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, sendOtp } from '../services/authService';

export default function OTPVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0); // starts at 0 so Resend isn't falsely blocked before the initial send completes
  const [initialSendDone, setInitialSendDone] = useState(false);
  const inputRefs = useRef([]);

  // ── Auto-send an OTP the moment this page loads ──────────────────────────
  // Registration already triggers one send server-side, but a user who
  // arrives here via a LOGIN redirect (unverified account, possibly with
  // a stale/expired/never-delivered OTP from an earlier attempt) has never
  // gotten a guaranteed-fresh code. Sending here unconditionally means the
  // page always works the same way regardless of entry path.
  useEffect(() => {
    if (!email || !role || initialSendDone) return;

    const sendInitial = async () => {
      try {
        await sendOtp({ email, role });
      } catch (err) {
        // Non-fatal — user can still hit Resend manually once the timer clears
        console.error('Initial OTP send failed:', err);
      } finally {
        setInitialSendDone(true);
        setTimer(60);
      }
    };

    sendInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, role]);

  useEffect(() => {
    if (timer === 0) return;
    const t = setInterval(() => setTimer(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  if (!email || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center max-w-sm">
          <p className="text-gray-600 mb-4">No verification session found.</p>
          <button onClick={() => navigate('/login')} className="text-teal-600 font-bold">Go to Login</button>
        </div>
      </div>
    );
  }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter all 6 digits'); return; }

    setLoading(true);
    setError('');
    try {
      const data = await verifyOtp({ email, otp: entered, role });
      if (data.message && data.message.includes('✅')) {
        setSuccess('Email verified! Redirecting to login...');
        setTimeout(() => {
          navigate(role === 'doctor' ? '/doctor/login' : '/patient/login');
        }, 1500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const data = await sendOtp({ email, role });
      if (data.message) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError('Could not resend OTP');
      }
    } catch (err) {
      setError('Server error. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">📧</div>
          <h2 className="text-xl font-bold text-gray-800">Verify your email</h2>
          <p className="text-sm text-gray-500 mt-1">
            {initialSendDone
              ? <>We sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span></>
              : <>Sending a code to <span className="font-semibold text-gray-700">{email}</span>...</>}
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2 rounded-xl mb-4 text-center">⚠️ {error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-4 py-2 rounded-xl mb-4 text-center">{success}</div>}

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-teal-500 transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white py-3 rounded-xl font-bold text-sm mb-3"
        >
          {loading ? '⏳ Verifying...' : '✅ Verify Email'}
        </button>

        <div className="text-center text-xs text-gray-400">
          {timer > 0 ? (
            <span>Resend in <span className="text-teal-600 font-bold">{timer}s</span></span>
          ) : (
            <button onClick={handleResend} disabled={resending} className="text-teal-600 font-bold">
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
