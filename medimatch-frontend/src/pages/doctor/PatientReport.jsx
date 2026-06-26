import React from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';

const ANOMALIES = [
  { icon: '🍬', name: 'Blood Glucose', value: '185 mg/dL', normal: '70–100 mg/dL', status: 'high', severity: 'critical', desc: 'Significantly elevated. Possible diabetes or prediabetes.' },
  { icon: '🩸', name: 'Hemoglobin',    value: '9.2 g/dL',  normal: '13.5–17.5 g/dL', status: 'low', severity: 'moderate', desc: 'Below normal range. May indicate anemia.' },
  { icon: '🦠', name: 'WBC Count',     value: '11,500 /µL',normal: '4,500–11,000 /µL', status: 'high', severity: 'moderate', desc: 'Slightly elevated. Possible infection.' },
  { icon: '🔬', name: 'Platelets',     value: '145,000 /µL',normal: '150,000–400,000 /µL', status: 'low', severity: 'mild', desc: 'Slightly below normal. Monitor closely.' },
  { icon: '💊', name: 'Cholesterol',   value: '198 mg/dL', normal: '< 200 mg/dL', status: 'normal', severity: 'normal', desc: 'Within acceptable range.' },
  { icon: '🫘', name: 'Creatinine',    value: '1.1 mg/dL', normal: '0.7–1.2 mg/dL', status: 'normal', severity: 'normal', desc: 'Normal kidney function.' },
];

export default function PatientReport() {
  const navigate = useNavigate();

  const severityConfig = {
    critical: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700' },
    moderate: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
    mild:     { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
    normal:   { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DoctorSidebar />
      <div className="ml-56 flex-1 p-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📄 Patient Report — Sneka Varsheni</h2>
            <p className="text-gray-400 text-sm mt-1">Blood Panel · Uploaded Mar 8, 2026 · AI Analyzed</p>
          </div>
          <button
            onClick={() => navigate('/doctor/prescription')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
          >
            💊 Write Prescription
          </button>
        </div>

        {/* Urgency Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">⚠️</div>
            <div>
              <h3 className="text-base font-bold text-gray-800">AI Urgency: <span className="text-orange-600">Moderate</span></h3>
              <p className="text-sm text-gray-500 mt-0.5">2 critical + 2 moderate findings. Recommend specialist consultation within 3–5 days.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">🔴 1 Critical</span>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">🟡 2 Moderate</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">🟢 3 Normal</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h3 className="text-base font-bold text-gray-800">Test Results & Anomalies</h3>
            {ANOMALIES.map((a) => {
              const cfg = severityConfig[a.severity];
              return (
                <div key={a.name} className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{a.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">{a.name}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{a.severity}</span>
                          {a.status !== 'normal' && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.status === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                              {a.status === 'high' ? '↑ HIGH' : '↓ LOW'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-800">{a.value}</div>
                      <div className="text-xs text-gray-400">Normal: {a.normal}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-5">
            {/* AI Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
              <div className="text-xl mb-2">🤖</div>
              <h3 className="text-sm font-bold mb-2">AI Doctor Notes</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Patient shows elevated blood glucose (185 mg/dL) and low hemoglobin. Findings suggest early-stage Type 2 diabetes with concurrent mild anemia. Recommend Metformin 500mg and iron supplementation.
              </p>
              <div className="mt-3 pt-3 border-t border-blue-500">
                <div className="text-xs text-blue-200">AI Confidence</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-blue-700 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full w-11/12" />
                  </div>
                  <span className="text-xs font-bold">94%</span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Patient Info</h3>
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">👩</div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Sneka Varsheni</div>
                  <div className="text-xs text-gray-500">Age 24 · Female · B+</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1.5">
                <div>📞 +91 98765 43210</div>
                <div>📅 First visit: Jan 2026</div>
                <div>💊 No known allergies</div>
                <div>🏥 2 previous visits</div>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => navigate('/doctor/video-consult')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
            >
              🎥 Start Video Consultation
            </button>
            <button
              onClick={() => navigate('/doctor/prescription')}
              className="w-full border border-blue-200 text-blue-600 hover:bg-blue-50 py-3 rounded-xl font-bold text-sm transition-all"
            >
              💊 Write Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}