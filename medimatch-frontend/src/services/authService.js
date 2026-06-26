const API = 'https://medimatch-backend-4t7f.onrender.com/api';

// Patient Register
export const patientRegister = async (data) => {
  const res = await fetch(`${API}/auth/patient/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Patient Login
export const patientLogin = async (data) => {
  const res = await fetch(`${API}/auth/patient/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Doctor Register
export const doctorRegister = async (data) => {
  const res = await fetch(`${API}/auth/doctor/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Doctor Login
export const doctorLogin = async (data) => {
  const res = await fetch(`${API}/auth/doctor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};