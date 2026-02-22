import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import SalesDashboard from './pages/SaleDashboard';
import DirectorDashboard from './pages/DirectorDashboard';

// This component checks if a user is logged in before letting them see the page
function RequireAuth({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />; // Kick them out if they have the wrong role
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard/manager" element={
        <RequireAuth allowedRole="MANAGER">
          <ManagerDashboard />
        </RequireAuth>
      } />
      
      <Route path="/dashboard/sales" element={
        <RequireAuth allowedRole="SALES_AGENT">
          <SalesDashboard />
        </RequireAuth>
      } />
      <Route path="/dashboard/director" element={
        <RequireAuth allowedRole="DIRECTOR">
          <DirectorDashboard />
        </RequireAuth>
      } />

      <Route path="/dashboard/sales" element={<div className="p-10 text-2xl">Sales Dashboard Coming Soon</div>} />
      <Route path="/dashboard/director" element={<div className="p-10 text-2xl">Director Dashboard Coming Soon</div>} />
    </Routes>
  );
}