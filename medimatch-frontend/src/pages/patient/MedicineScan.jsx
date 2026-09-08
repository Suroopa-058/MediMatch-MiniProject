import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../../components/patient/PatientSidebar';

export default function MedicineScan() {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  };

  const handleFileInput = (e) => {
    if (e.target.files[0]) selectFile(e.target.files[0]);
  };

  const selectFile = (f) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) { alert('Please select an image first'); return; }

    setAnalyzing(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', 'en');

    try {
      const res = await fetch('https://medimatch-backend-4t7f.onrender.com/api/scan/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setAnalyzing(false);

      if (res.ok && data.success) {
        navigate('/patient/scan-result', { state: { result: data } });
      } else if (data.needsBetterImage) {
        alert(data.message || 'Please try a clearer photo.');
      } else {
        alert('Analysis failed: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Server error! Make sure backend is running.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />

      <div className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">💊 Medicine Scanner</h2>
          <p className="text-gray-400 text-sm mt-1">
            Upload a photo of a tablet strip or prescription — our AI agent identifies it and explains how to take it
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left — Upload */}
          <div className="col-span-2 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-base font-bold text-gray-800 mb-4">Upload Medicine Photo</h3>

              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
                    ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300 bg-gray-50'}`}
                  onClick={() => document.getElementById('medImageInput').click()}
                >
                  <div className="text-5xl mb-3">📸</div>
                  <p className="text-base font-bold text-gray-700">Drag & Drop a medicine photo here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-3">Tablet strip or prescription · JPG, PNG · Max 15MB</p>
                  <input
                    id="medImageInput" type="file" className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="rounded-2xl p-5 border-2 border-teal-300 bg-teal-50">
                  <div className="flex items-center gap-4">
                    <img src={previewUrl} alt="preview" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{file.name}</div>
                      <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    {!analyzing && (
                      <button
                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                        className="text-red-400 hover:text-red-600 text-sm font-semibold"
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  {analyzing && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full animate-pulse w-3/4" />
                      </div>
                      <p className="text-xs text-teal-600 mt-1 font-medium">Agent analyzing — extracting, verifying, and explaining...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800">
              ⚠️ For educational reference only. Always follow your doctor's or pharmacist's actual instructions.
            </div>
          </div>

          {/* Right — Info + Action */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="text-sm font-bold mb-2">AI Agent Pipeline</h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                Our agent extracts the medicine name from your photo, checks it against a verified knowledge base, and explains it in simple language.
              </p>
              <div className="mt-3 space-y-1.5">
                {['Vision Extraction', 'Knowledge Retrieval', 'Verified Explanation'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-teal-100">
                    <span className="text-teal-300">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !file}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
            >
              {analyzing ? '⏳ Analyzing...' : '💊 Identify Medicine'}
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
