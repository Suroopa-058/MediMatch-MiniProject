import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

const REPORT_TYPES = [
  { id: 'blood',   icon: '🩸', label: 'Blood Test',  desc: 'CBC, lipid panel, glucose...' },
  { id: 'ecg',     icon: '🫀', label: 'ECG',          desc: 'Electrocardiogram report' },
  { id: 'xray',    icon: '🦴', label: 'X-Ray',        desc: 'Chest, bone, dental X-Ray' },
  { id: 'mri',     icon: '🧠', label: 'MRI Scan',     desc: 'Brain, spine, joint MRI' },
  { id: 'ct',      icon: '🔬', label: 'CT Scan',      desc: 'Abdomen, chest, head CT' },
  { id: 'urine',   icon: '🧪', label: 'Urine Test',   desc: 'Urinalysis, culture test' },
  { id: 'thyroid', icon: '⚗️', label: 'Thyroid',      desc: 'T3, T4, TSH levels' },
  { id: 'other',   icon: '📋', label: 'Other',        desc: 'Any other medical report' },
];

export default function ReportUpload() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [notes, setNotes] = useState('');
  const [reportMeta, setReportMeta] = useState(null); // ✅ NEW

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileInput = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedType) { alert('Please select report type'); return; }
    if (!file) { alert('Please select a file'); return; }

    setUploading(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', selectedType);
    formData.append('notes', notes);

    try {
      const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/reports', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setUploading(false);
        setUploaded(true);
        // ✅ Save report id and file path for AI Analysis
        setReportMeta({ id: data.id, filePath: data.file_url });
      } else {
        alert('Upload failed: ' + data.message);
        setUploading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Server error! Make sure backend is running.');
      setUploading(false);
    }
  };

  // ✅ Pass real data to AI Analysis page
  const handleAnalyze = () => {
    navigate('/patient/ai-analysis', {
      state: {
        reportId: reportMeta?.id,
        filePath: reportMeta?.filePath,
        reportType: REPORT_TYPES.find(t => t.id === selectedType)?.label
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />

      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📄 Upload Medical Report</h2>
          <p className="text-gray-400 text-sm mt-1">Upload your report for AI-powered analysis and specialist recommendation</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Select Type', icon: '📋' },
              { step: 2, label: 'Upload File', icon: '📤' },
              { step: 3, label: 'AI Analysis', icon: '🧬' },
              { step: 4, label: 'Find Doctor', icon: '👨‍⚕️' },
            ].map((s, i) => {
              const active = !uploaded ? s.step <= (file ? 2 : selectedType ? 2 : 1) : s.step <= 2;
              return (
                <React.Fragment key={s.step}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all
                      ${uploaded && s.step <= 2 ? 'bg-teal-600 text-white' :
                        active ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>
                      {uploaded && s.step <= 2 ? '✓' : s.icon}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-teal-700' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${uploaded && s.step <= 1 ? 'bg-teal-500' : 'bg-gray-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left — Report Type + Upload */}
          <div className="col-span-2 space-y-5">

            {/* Report Type Selection */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Step 1 — Select Report Type</h3>
              <div className="grid grid-cols-4 gap-3">
                {REPORT_TYPES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl cursor-pointer border-2 transition-all
                      ${selectedType === t.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-100 hover:border-teal-200 bg-gray-50'}`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-xs font-bold text-gray-700 text-center">{t.label}</span>
                    <span className="text-xs text-gray-400 text-center leading-tight">{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Step 2 — Upload File</h3>

              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
                    ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300 bg-gray-50'}`}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <div className="text-5xl mb-3">📂</div>
                  <p className="text-base font-bold text-gray-700">Drag & Drop your report here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-3">Supported: PDF, JPG, PNG · Max 20MB</p>
                  <input
                    id="fileInput" type="file" className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className={`rounded-2xl p-5 border-2 ${uploaded ? 'border-green-300 bg-green-50' : 'border-teal-300 bg-teal-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {file.name.endsWith('.pdf') ? '📄' : '🖼️'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                          {selectedType && ` · ${REPORT_TYPES.find(t => t.id === selectedType)?.label}`}
                        </div>
                      </div>
                    </div>
                    {uploaded ? (
                      <span className="text-green-600 font-bold text-sm">✅ Uploaded</span>
                    ) : (
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-600 text-sm font-semibold"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  {uploading && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full animate-pulse w-3/4" />
                      </div>
                      <p className="text-xs text-teal-600 mt-1 font-medium">Uploading to secure server...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-3">Additional Notes (Optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms, concern, or anything you'd like the AI to focus on..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400 resize-none"
              />
            </div>
          </div>

          {/* Right — Summary + Action */}
          <div className="space-y-5">

            {/* Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Upload Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Report Type</span>
                  <span className="text-xs font-bold text-gray-800">
                    {selectedType ? REPORT_TYPES.find(t => t.id === selectedType)?.label : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">File</span>
                  <span className="text-xs font-bold text-gray-800 max-w-24 truncate">
                    {file ? file.name : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">File Size</span>
                  <span className="text-xs font-bold text-gray-800">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`text-xs font-bold ${uploaded ? 'text-green-600' : 'text-orange-500'}`}>
                    {uploaded ? '✅ Uploaded' : file ? '⏳ Ready to upload' : '❌ No file'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Info */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white">
              <div className="text-2xl mb-2">🧬</div>
              <h3 className="text-sm font-bold mb-2">AI Analysis</h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                Our AI will scan your report, detect anomalies, assess urgency, and recommend the right specialist automatically.
              </p>
              <div className="mt-3 space-y-1.5">
                {['Anomaly Detection', 'Urgency Assessment', 'Specialist Mapping'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-teal-100">
                    <span className="text-teal-300">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {!uploaded ? (
              <button
                onClick={handleUpload}
                disabled={uploading || !file || !selectedType}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload & Analyze'}
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg animate-pulse"
              >
                🧬 View AI Analysis →
              </button>
            )}

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