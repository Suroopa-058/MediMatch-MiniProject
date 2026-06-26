import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';

const DEFAULT_MEDS = [
  { id: 1, name: 'Metformin 500mg',       dose: '1 tablet', freq: 'Twice daily', duration: '90 days', instruction: 'After meals' },
  { id: 2, name: 'Ferrous Sulfate 325mg', dose: '1 tablet', freq: 'Once daily',  duration: '60 days', instruction: 'Morning' },
  { id: 3, name: 'Vitamin D3 60,000 IU',  dose: '1 capsule',freq: 'Once weekly', duration: '8 weeks', instruction: 'With food' },
];

export default function Prescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId, patientId, patientName } = location.state || {};

  const [meds, setMeds] = useState(DEFAULT_MEDS);
  const [diagnosis, setDiagnosis] = useState('Type 2 Diabetes Mellitus with Mild Anemia');
  const [notes, setNotes] = useState('Patient presents with significantly elevated blood glucose and low hemoglobin. Initiating Metformin therapy and iron supplementation. Follow-up in 4 weeks.');
  const [newMed, setNewMed] = useState({ name: '', dose: '', freq: '', duration: '', instruction: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const addMed = () => {
    if (!newMed.name) return;
    setMeds(prev => [...prev, { id: Date.now(), ...newMed }]);
    setNewMed({ name: '', dose: '', freq: '', duration: '', instruction: '' });
  };

  const removeMed = (id) => setMeds(prev => prev.filter(m => m.id !== id));

  const handleSend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/appointments/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          patient_id: patientId,
          diagnosis,
          notes,
          medications: meds
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSent(true);
        setTimeout(() => navigate('/doctor/dashboard'), 2500);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="ml-56 flex-1 p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">💊 Write Prescription</h2>
            <p className="text-gray-400 text-sm mt-1">Patient: {patientName || 'Sneka Varsheni'}</p>
          </div>
          <button onClick={handleSend} disabled={sent || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-green-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">
            {sent ? '✅ Sent to Patient!' : loading ? '⏳ Sending...' : '📤 Send Prescription'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Patient & Diagnosis</h3>
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">👩</div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{patientName || 'Sneka Varsheni'}</div>
                  <div className="text-xs text-gray-500">Appointment #{appointmentId}</div>
                </div>
              </div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Diagnosis</label>
              <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 mb-4" />
              <label className="block text-sm font-semibold text-gray-600 mb-1">Doctor Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none" />
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Medications</h3>
              <div className="space-y-3 mb-4">
                {meds.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💊</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.dose} · {m.freq} · {m.duration} · {m.instruction}</div>
                    </div>
                    <button onClick={() => removeMed(m.id)} className="text-red-400 hover:text-red-600 text-sm font-bold">✕</button>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-3">+ Add Medicine</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input placeholder="Medicine name" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                  <input placeholder="Dosage" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                  <input placeholder="Frequency" value={newMed.freq} onChange={e => setNewMed({...newMed, freq: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                  <input placeholder="Duration" value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                  <input placeholder="Instructions" value={newMed.instruction} onChange={e => setNewMed({...newMed, instruction: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 col-span-2" />
                </div>
                <button onClick={addMed}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold">
                  + Add Medicine
                </button>
              </div>
            </div>
          </div>

          {/* Right Preview */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-4 text-center mb-4">
                <div className="text-3xl font-black text-blue-200 mb-1">℞</div>
                <div className="text-sm font-bold">Dr. Priya Sharma</div>
                <div className="text-xs text-blue-200 mt-1">MBBS, MD · Diabetologist</div>
                <div className="text-xs text-blue-300">Apollo Hospital, Chennai</div>
              </div>
              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Patient</span>
                  <span className="font-bold text-gray-800">{patientName || 'Sneka Varsheni'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Diagnosis</span>
                  <span className="font-bold text-gray-800 max-w-32 text-right text-xs leading-tight">{diagnosis.substring(0, 30)}...</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="text-xs font-bold text-gray-400 mb-2">MEDICATIONS</div>
                {meds.map((m, i) => (
                  <div key={m.id} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0">
                    <span className="font-bold">{i + 1}. {m.name}</span>
                    <div className="text-gray-400">{m.dose} · {m.freq} · {m.duration}</div>
                  </div>
                ))}
              </div>
              <button onClick={handleSend} disabled={sent || loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-green-500 text-white py-3 rounded-xl font-bold text-sm transition-all">
                {sent ? '✅ Sent!' : loading ? '⏳...' : '📤 Send to Patient'}
              </button>
            </div>
            <button onClick={() => navigate('/doctor/dashboard')}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}