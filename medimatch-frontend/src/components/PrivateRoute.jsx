import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role');

  if (!token || storedRole !== role) {
    if (role === 'doctor') return <Navigate to="/doctor/login" replace />;
    return <Navigate to="/patient/login" replace />;
  }

  return children;
}