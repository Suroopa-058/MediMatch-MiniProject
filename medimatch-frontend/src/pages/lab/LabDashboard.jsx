import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPatient, uploadLabReport } from '../../services/labAuthService';

const REPORT_TYPES = [
  'Blood Test', 'ECG', 'X-Ray', 'MRI Scan', 'CT Scan', 'Urine Test', 'Thyroid Panel', 'Other'
];

export default function LabDashboard() {
  const navigate = useNavigate();
  const [lab] = useState(() => {
    const stored = localStorage.getItem('lab');
    return stored ? JSON.parse(stored) : null;
  });

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [patient, setPatient] = useState(null);

  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) { setSearchError('Enter a phone number or email'); return; }
    setSearching(true);
    setSearchError('');
    setPatient(null);
    setUploadSuccess(false);
    try {
      const result = await searchPatient(query.trim());
      if (result.id) {
        setPatient(result);
      } else {
        setSearchError(result.message || 'Patient not found');
      }
    } catch (err) {
      setSearchError('Server error. Try again.');
    }
    setSearching(false);
  };

  const handleUpload = async () => {
    if (!file) { alert('Please select a file'); return; }
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', patient.id);
    formData.append('report_type', reportType);
    formData.append('notes', notes);

    try {
      const result = await uploadLabReport(formData);
      if (result.message && result.message.includes('✅')) {
        setUploadSuccess(true);
        setFile(null);
        setNotes('');
      } else {
        alert('Upload failed: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Server error during upload.');
    }
    setUploading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/lab/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">🧪</div>
          <div>
            <div className="text-sm font-bold text-gray-800">{lab?.name || 'Lab Portal'}</div>
            <div className="text-xs text-gray-400">{lab?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-500 text-sm font-semibold hover:text-red-600">
          🚪 Logout
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Upload Patient Report</h2>
        <p className="text-gray-400 text-sm mb-6">Search a patient by phone or email, then upload their report</p>

        {/* Search */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Step 1 — Find Patient</h3>
          <div className="flex gap-3">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Patient phone or email"
              className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 rounded-xl font-bold text-sm"
            >
              {searching ? '⏳' : '🔍 Search'}
            </button>
          </div>
          {searchError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2">
              ⚠️ {searchError}
            </div>
          )}
        </div>

        {/* Patient found */}
        {patient && (
          <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm mb-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">👤</div>
              <div>
                <div className="text-base font-bold text-gray-800">{patient.full_name}</div>
                <div className="text-xs text-gray-500">
                  {patient.email} · {patient.phone} · {patient.age ? `${patient.age}y` : ''} {patient.gender}
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-800 mb-3">Step 2 — Upload Report</h3>

            <label className="block text-xs font-bold text-gray-500 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 mb-4 bg-white"
            >
              {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>

            <label className="block text-xs font-bold text-gray-500 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any remarks about this report..."
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 mb-4 resize-none"
            />

            <label className="block text-xs font-bold text-gray-500 mb-1">Report File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 mb-4"
            />

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm"
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload Report'}
            </button>

            {uploadSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 text-center font-semibold">
                ✅ Report uploaded and linked to {patient.full_name}'s account!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
