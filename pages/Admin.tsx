import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

const Admin: React.FC = () => {
  const { isAuthenticated } = useAdmin();

  return (
    <div className="admin-page">
      {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
};

export default Admin;
