import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

const DOCTORS = [
  {
    id: 1, name: 'Dr. Priya Sharma', spec: 'Diabetologist', exp: '12 yrs',
    rating: 4.9, reviews: 1240, fee: '₹800', feeNum: 800,
    hospital: 'Apollo Hospital, Chennai', available: 'Today 4:00 PM',
    tags: ['Diabetes', 'Endocrinology', 'Thyroid'],
    match: '98%', icon: '👩‍⚕️', languages: 'English, Tamil, Hindi',
    about: 'Specialist in managing Type 1 & Type 2 diabetes with 12+ years of clinical experience.',
  },
  {
    id: 2, name: 'Dr. Rajan Kumar', spec: 'Hematologist', exp: '9 yrs',
    rating: 4.7, reviews: 890, fee: '₹600', feeNum: 600,
    hospital: 'Fortis Hospital, Chennai', available: 'Tomorrow 10:00 AM',
    tags: ['Blood Disorders', 'Anemia', 'Leukemia'],
    match: '91%', icon: '👨‍⚕️', languages: 'English, Tamil',
    about: 'Expert in blood disorders and hematological malignancies with international training.',
  },
  {
    id: 3, name: 'Dr. Meena Iyer', spec: 'General Physician', exp: '15 yrs',
    rating: 4.8, reviews: 2100, fee: '₹400', feeNum: 400,
    hospital: 'MIOT Hospital, Chennai', available: 'Today 6:00 PM',
    tags: ['General Medicine', 'Preventive Care', 'Wellness'],
    match: '85%', icon: '👩‍⚕️', languages: 'English, Tamil, Telugu',
    about: 'Experienced general physician providing comprehensive primary care.',
  },
  {
    id: 4, name: 'Dr. Arjun Nair', spec: 'Cardiologist', exp: '18 yrs',
    rating: 4.9, reviews: 3200, fee: '₹1200', feeNum: 1200,
    hospital: 'Kauvery Hospital, Chennai', available: 'Mar 25, 9:00 AM',
    tags: ['Heart Disease', 'ECG', 'Hypertension'],
    match: '79%', icon: '👨‍⚕️', languages: 'English, Malayalam, Tamil',
    about: 'Senior cardiologist with expertise in interventional cardiology.',
  },
  {
    id: 5, name: 'Dr. Kavitha Raj', spec: 'Neurologist', exp: '11 yrs',
    rating: 4.6, reviews: 760, fee: '₹900', feeNum: 900,
    hospital: 'Sri Ramachandra Hospital', available: 'Mar 28, 2:00 PM',
    tags: ['Neurology', 'Migraine', 'Epilepsy'],
    match: '72%', icon: '👩‍⚕️', languages: 'English, Tamil',
    about: 'Neurologist specializing in headache disorders and epilepsy.',
  },
];

const FILTERS = ['All', 'Diabetologist', 'Hematologist', 'Cardiologist', 'Neurologist', 'General Physician'];

export default function DoctorSwipe() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [liked, setLiked] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [swipeDir, setSwipeDir] = useState(null);
  const [showList, setShowList] = useState(false);
  const [booking, setBooking] = useState(false);

  const filtered = DOCTORS.filter(d => filter === 'All' || d.spec === filter)
    .filter(d => !skipped.includes(d.id));

  const current = filtered[currentIndex];

  // ✅ Fixed: setBooking(false) before navigate
  const bookAppointment = async (doctor) => {
    setBooking(true);
    const token = localStorage.getItem('token');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    try {
      const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          appointment_date: dateStr,
          appointment_time: '10:00:00',
          reason: `Consultation with ${doctor.spec}`,
          fee: doctor.feeNum
        })
      });

      const data = await res.json();
      console.log('Full booking response:', JSON.stringify(data))

      if (res.ok) {
        setBooking(false); // ✅ before navigate
        sessionStorage.setItem('appointmentId', data.id);  // ← NEW LINE
        navigate('/patient/otp-confirm', {
          state: {
            appointmentId: data.id,
            doctorName: doctor.name,
            doctorSpec: doctor.spec,
            hospital: doctor.hospital,
            date: dateStr,
            time: '10:00 AM',
            fee: doctor.feeNum
          }
        });
      } else {
        setBooking(false);
        alert('Booking failed: ' + data.message);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBooking(false);
      alert('Server error! Make sure backend is running.');
    }
  };

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(async () => {
      if (dir === 'right') {
        setLiked(prev => [...prev, current.id]);
        await bookAppointment(current);
      } else {
        setSkipped(prev => [...prev, current.id]);
        setCurrentIndex(0);
      }
      setSwipeDir(null);
    }, 400);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">👨‍⚕️ Find Your Doctor</h2>
            <p className="text-gray-400 text-sm mt-1">AI-matched specialists based on your report analysis</p>
          </div>
          <button onClick={() => setShowList(!showList)}
            className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-all
              ${showList ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}>
            {showList ? '🃏 Card View' : '📋 List View'}
          </button>
        </div>

        {/* AI Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-4 mb-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <div className="text-sm font-bold">AI Recommendation Active</div>
              <div className="text-xs text-teal-100">Doctors ranked by match % based on your report</div>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">✅ {liked.length} Booked</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">⏭️ {skipped.length} Skipped</span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setFilter(f); setCurrentIndex(0); }}
              className={`text-xs px-4 py-2 rounded-full font-semibold border transition-all
                ${filter === f ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Booking loading overlay */}
        {booking && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
              <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-4"
                style={{ border: '3px solid #0d9488', borderTopColor: 'transparent' }} />
              <p className="font-semibold text-gray-800">Booking appointment...</p>
            </div>
          </div>
        )}

        {/* Card View */}
        {!showList && (
          <div className="flex gap-8 items-start justify-center">
            <div className="flex flex-col items-center">
              {current ? (
                <>
                  <div className={`w-80 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300
                    ${swipeDir === 'right' ? 'translate-x-20 rotate-6 opacity-0' :
                      swipeDir === 'left' ? '-translate-x-20 -rotate-6 opacity-0' : ''}`}>
                    <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 text-white text-center relative">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                        {current.icon}
                      </div>
                      <h3 className="text-lg font-bold">{current.name}</h3>
                      <p className="text-teal-100 text-sm">{current.spec}</p>
                      <div className="absolute top-4 right-4 bg-white text-teal-700 text-xs font-bold px-2 py-1 rounded-full">
                        {current.match} match
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <div className="bg-gray-50 rounded-xl p-2">
                          <div className="text-sm font-bold text-gray-800">⭐ {current.rating}</div>
                          <div className="text-xs text-gray-400">Rating</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2">
                          <div className="text-sm font-bold text-gray-800">{current.exp}</div>
                          <div className="text-xs text-gray-400">Experience</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2">
                          <div className="text-sm font-bold text-gray-800">{current.fee}</div>
                          <div className="text-xs text-gray-400">Fee</div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <span>🏥</span><span>{current.hospital}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <span>🕐</span><span className="text-green-600 font-semibold">Next: {current.available}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <span>🗣️</span><span>{current.languages}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{current.about}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {current.tags.map(t => (
                          <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Swipe Buttons */}
                  <div className="flex items-center gap-6 mt-6">
                    <button onClick={() => handleSwipe('left')}
                      className="w-14 h-14 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-full flex items-center justify-center text-2xl shadow-md transition-all">
                      ✕
                    </button>
                    <div className="text-xs text-gray-400 text-center">
                      <div>{currentIndex + 1} / {filtered.length}</div>
                      <div>doctors</div>
                    </div>
                    <button onClick={() => handleSwipe('right')}
                      className="w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-2xl shadow-md transition-all">
                      ✓
                    </button>
                  </div>
                  <div className="flex gap-8 mt-2 text-xs text-gray-400">
                    <span>← Skip</span>
                    <span>Book →</span>
                  </div>
                </>
              ) : (
                <div className="w-80 bg-white rounded-3xl shadow-xl p-10 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-lg font-bold text-gray-800">All caught up!</h3>
                  <p className="text-sm text-gray-400 mt-2">No more doctors in this category.</p>
                  <button onClick={() => { setFilter('All'); setSkipped([]); setCurrentIndex(0); }}
                    className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-semibold">
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Up Next */}
            <div className="space-y-3 w-64 mt-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Up Next</p>
              {filtered.slice(currentIndex + 1, currentIndex + 4).map((d, i) => (
                <div key={d.id} className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition-all ${i === 0 ? 'opacity-100' : i === 1 ? 'opacity-60' : 'opacity-30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-xl">{d.icon}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{d.name}</div>
                      <div className="text-xs text-gray-400">{d.spec} · {d.match} match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {showList && (
          <div className="space-y-4">
            {filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:border-teal-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl">{d.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-800">{d.name}</h3>
                      <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">{d.match} match</span>
                    </div>
                    <p className="text-xs text-gray-500">{d.spec} · {d.hospital}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-yellow-600 font-semibold">⭐ {d.rating} ({d.reviews})</span>
                      <span className="text-xs text-gray-400">{d.exp} exp</span>
                      <span className="text-xs text-green-600 font-semibold">🕐 {d.available}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <div className="text-base font-bold text-teal-700">{d.fee}</div>
                    <div className="text-xs text-gray-400">per consult</div>
                  </div>
                  <button onClick={() => bookAppointment(d)}
                    disabled={booking}
                    className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                    {booking ? '⏳...' : 'Book →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}