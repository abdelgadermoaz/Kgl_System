import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import SalesDashboard from './pages/SalesDashboard'
import DirectorDashboard from './pages/DirectorDashboard';
import UserManagement from './pages/UserManagement'; 

function RequireAuth({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" replace />;

  const user = JSON.parse(userStr || '{}');
  if (user.role !== allowedRole) return <Navigate to="/login" replace />; 

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
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

      <Route path="/dashboard/director/users" element={
        <RequireAuth allowedRole="DIRECTOR">
         <UserManagement />
        </RequireAuth>
      } />
    </Routes>
  );
}