import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

const severityConfig = {
  critical: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',      label: 'Critical' },
  moderate: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', label: 'Moderate' },
  mild:     { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: 'Mild' },
  normal:   { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',   label: 'Normal' },
};

const scanSteps = [
  'Reading report file...',
  'Extracting test values...',
  'Comparing with normal ranges...',
  'Detecting anomalies...',
  'Assessing urgency level...',
  'Mapping to specialists...',
  'Analysis complete ✓',
];

export default function AIAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pass reportId and filePath from ReportUpload page after successful upload
  const { reportId, filePath, reportType } = location.state || {};

  const [scanStep, setScanStep] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Animate scan steps
  useEffect(() => {
    if (scanStep < scanSteps.length - 1) {
      const t = setTimeout(() => setScanStep(s => s + 1), 700);
      return () => clearTimeout(t);
    }
  }, [scanStep]);

  // Call real API once
  useEffect(() => {
    if (!reportId || !filePath) {
      setError('No report found. Please upload a report first.');
      setScanning(false);
      return;
    }

    const analyze = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/ai/analyze-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reportId, filePath, reportType })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setResult(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setScanning(false);
      }
    };

    analyze();
  }, [reportId, filePath, reportType]);

  const urgencyColors = {
    critical: 'text-red-600',
    moderate: 'text-orange-600',
    mild: 'text-yellow-600',
    normal: 'text-green-600',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🧬 AI Report Analysis</h2>
          <p className="text-gray-400 text-sm mt-1">{reportType} · Analyzed by MediMatch AI</p>
        </div>

        {/* Scanning */}
        {scanning && (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-80">
            <div className="relative w-24 h-24 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-teal-100 absolute" />
              <div className="w-24 h-24 rounded-full border-4 border-teal-500 border-t-transparent absolute animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🧬</div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Analyzing your report...</h3>
            <div className="w-full max-w-xs space-y-2">
              {scanSteps.map((step, i) => (
                <div key={step} className={`flex items-center gap-3 text-sm transition-all ${i <= scanStep ? 'opacity-100' : 'opacity-20'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i < scanStep ? 'bg-teal-500 text-white' : i === scanStep ? 'bg-teal-100 text-teal-700 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                    {i < scanStep ? '✓' : i + 1}
                  </span>
                  <span className={i <= scanStep ? 'text-gray-700 font-medium' : 'text-gray-300'}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!scanning && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">❌</div>
            <h3 className="text-lg font-bold text-red-700 mb-2">Analysis Failed</h3>
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => navigate('/patient/report-upload')}
              className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!scanning && result && (
          <div className="space-y-6">

            {/* Urgency Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">⚠️</div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    Urgency Level: <span className={urgencyColors[result.urgency] || 'text-gray-700'}>
                      {result.urgency?.charAt(0).toUpperCase() + result.urgency?.slice(1)}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{result.urgencyReason}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

              {/* Findings */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-base font-bold text-gray-800">Test Results & Anomalies</h3>
                {result.findings?.map((a, i) => {
                  const cfg = severityConfig[a.severity] || severityConfig.normal;
                  return (
                    <div key={i} className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800">{a.name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                            {a.status !== 'normal' && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.status === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {a.status === 'high' ? '↑ HIGH' : '↓ LOW'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
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

              {/* Right Panel */}
              <div className="space-y-5">

                {/* AI Summary */}
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white">
                  <div className="text-xl mb-2">🤖</div>
                  <h3 className="text-sm font-bold mb-2">AI Summary</h3>
                  <p className="text-xs text-teal-100 leading-relaxed">{result.summary}</p>
                  <div className="mt-3 pt-3 border-t border-teal-500">
                    <div className="text-xs text-teal-200">Confidence Score</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-teal-700 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${result.confidenceScore}%` }} />
                      </div>
                      <span className="text-xs font-bold">{result.confidenceScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Specialists */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Recommended Specialists</h3>
                  <div className="space-y-3">
                    {result.specialists?.map((s, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-3 hover:border-teal-200 transition-all">
                        <div className="text-sm font-bold text-gray-800">{s.type}</div>
                        <div className="text-xs text-teal-600 mt-1">→ {s.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => navigate('/patient/doctor-swipe')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg">
                  👨‍⚕️ Find & Book Doctor →
                </button>

                <button onClick={() => navigate('/patient/report-upload')}
                  className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold transition-all">
                  📄 Upload Another Report
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}