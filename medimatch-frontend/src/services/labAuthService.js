const API = 'https://medimatch-backend-4t7f.onrender.com/api';

export const labRegister = async (data) => {
  const res = await fetch(`${API}/lab/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const labLogin = async (data) => {
  const res = await fetch(`${API}/lab/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const searchPatient = async (query) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/lab/search-patient?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const uploadLabReport = async (formData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/lab/upload-report`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const getLabReportsForPatient = async (patientId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/lab/reports/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};