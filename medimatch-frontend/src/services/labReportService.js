const API = 'https://medimatch-backend-4t7f.onrender.com/api';

export const getMyLabReports = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/patient-lab-reports/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};