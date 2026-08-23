import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

export default function ScanResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {};
  const [showTrace, setShowTrace] = useState(false);

  if (!result) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PatientSidebar />
        <div className="ml-56 flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">❌</div>
            <h3 className="text-lg font-bold text-red-700 mb-2">No scan result found</h3>
            <p className="text-red-500 text-sm">Please scan a medicine first.</p>
            <button onClick={() => navigate('/patient/medicine-scan')}
              className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
              Go to Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { explanation, extraction, alternativeMatches, agentTrace } = result;
  const isVerified = explanation?.verified;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-56 flex-1 p-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">💊 Medicine Identified</h2>
          <p className="text-gray-400 text-sm mt-1">Analyzed by MediMatch AI Agent</p>
        </div>

        {/* Verified / Unverified Banner */}
        <div className={`rounded-2xl p-5 flex items-center justify-between mb-6 border
          ${isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
              ${isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {isVerified ? '✅' : '⚠️'}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {isVerified ? 'Verified against knowledge base' : 'Unverified — not in our knowledge base'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {isVerified
                  ? 'This information comes directly from our verified medicine database.'
                  : 'This is a best-effort explanation. Please confirm with a pharmacist or doctor.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Extraction confidence</div>
            <div className="text-lg font-bold text-gray-800">{extraction?.confidence}%</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left — Explanation */}
          <div className="col-span-2 space-y-4">

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{explanation?.medicine_name}</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs font-bold text-teal-600 uppercase mb-1">Used For</div>
                  <p className="text-sm text-gray-700">{explanation?.used_for}</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-teal-600 uppercase mb-1">How to Take</div>
                  <p className="text-sm text-gray-700">{explanation?.how_to_take}</p>
                </div>
                <div>
                  <div className="text-xs font-bold text-teal-600 uppercase mb-1">Important Instructions</div>
                  <ul className="space-y-1.5 mt-2">
                    {explanation?.important_instructions?.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-400 mt-0.5">•</span> {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {alternativeMatches?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Other possible matches</h3>
                <div className="flex flex-wrap gap-2">
                  {alternativeMatches.map((m, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Trace — collapsible, shows the actual decision steps */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <button
                onClick={() => setShowTrace(!showTrace)}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-800"
              >
                <span>🤖 Agent Reasoning Trace</span>
                <span className="text-gray-400">{showTrace ? '▲' : '▼'}</span>
              </button>
              {showTrace && (
                <div className="mt-4 space-y-2">
                  {agentTrace?.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs border-l-2 border-teal-200 pl-3 py-1">
                      <span className="font-bold text-teal-600 uppercase">{step.step}</span>
                      <span className="text-gray-500">
                        {step.status && `${step.status} `}
                        {step.choice && `→ ${step.choice} (${step.reason})`}
                        {step.result && JSON.stringify(step.result)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Actions */}
          <div className="space-y-5">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800">
              ⚠️ For educational reference only. Always follow your doctor's or pharmacist's actual instructions.
            </div>

            <button
              onClick={() => navigate('/patient/medicine-scan')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
            >
              📸 Scan Another Medicine
            </button>

            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
