import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';
import { getMyLabReports } from '../../services/labReportService';

export default function LabReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLabReports()
      .then(data => setReports(Array.isArray(data) ? data : []))
      .catch(err => console.error('Lab reports error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />

      <div className="ml-56 flex-1 p-8">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🧪 Reports from Lab</h2>
          <p className="text-gray-400 text-sm mt-1">All reports uploaded to your account by diagnostic labs</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '3px solid #4f46e5', borderTopColor: 'transparent' }} />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
            <div className="text-5xl mb-3">🧪</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No lab reports yet</h3>
            <p className="text-sm text-gray-400 mb-6">
              When a lab uploads a report for you, it will appear here.
            </p>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold"
            >
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">🧪</div>
                <div className="flex-1">
                  <div className="text-base font-bold text-gray-800">{r.report_type}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Uploaded by {r.lab_name} · {new Date(r.uploaded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {r.notes && (
                    <div className="text-xs text-gray-500 mt-1 italic">"{r.notes}"</div>
                  )}
                </div>
                <a
                  href={`https://medimatch-backend-4t7f.onrender.com${r.file_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap"
                >
                  ⬇ Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
