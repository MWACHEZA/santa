import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import Header from './Header';
import Footer from './Footer';
import Home from '../pages/Home';
import Prayers from '../pages/Prayers';
import Gallery from '../pages/Gallery';
import Ministries from '../pages/Ministries';
import Outreach from '../pages/Outreach';
import WatchMass from '../pages/WatchMass';
import Sacraments from '../pages/Sacraments';
import Calendar from '../pages/Calendar';
import Contact from '../pages/Contact';
import Giving from '../pages/Giving';
import News from '../pages/News';
import AdminDashboard from '../pages/admin/AdminDashboard';
// import AdminLogin from '../pages/admin/AdminLogin'; // Currently unused
import ModernLogin from './auth/ModernLogin';
import ChangePassword from './auth/ChangePassword';
import EnhancedProfile from './EnhancedProfile';
import LoadingSpinner from './common/LoadingSpinner';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated: isUserAuthenticated, user, isLoading: authLoading } = useAuth();
  const { isLoading: adminLoading } = useAdmin();

  // Helper function to get default route based on user role
  const getDefaultRoute = (userRole: string) => {
    switch (userRole) {
      case 'admin':
      case 'secretary':
      case 'priest':
      case 'reporter':
        return '/admin';
      case 'parishioner':
      default:
        return '/';
    }
  };

  // Show loading state while checking authentication or admin context
  if (authLoading || adminLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading...</p>
      </div>
    );
  }

  // Public routes that don't require authentication
  const isPublicRoute = window.location.pathname === '/login' || 
                       window.location.pathname === '/register' ||
                       window.location.pathname === '/change-password';

  // If not authenticated and not on a public route, redirect to login
  if (!isUserAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but on login page, redirect to appropriate dashboard
  if (isUserAuthenticated && window.location.pathname === '/login') {
    const defaultRoute = getDefaultRoute(user?.role || 'parishioner');
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <>
      {/* Show Header and Footer only for authenticated non-admin routes */}
      {isUserAuthenticated && !window.location.pathname.startsWith('/admin') && <Header />}
      
      <main>
        <Routes>
          {/* Authentication Routes - Always accessible */}
          <Route path="/login" element={<ModernLogin />} />
          <Route path="/register" element={<ModernLogin initialShowRegister={true} />} />
          <Route path="/change-password" element={<ChangePassword />} />
          
          {/* Admin Routes - Check if user has admin role */}
          <Route 
            path="/admin/*" 
            element={
              isUserAuthenticated && user && ['admin', 'secretary', 'priest', 'reporter'].includes(user.role) 
                ? <AdminDashboard /> 
                : <Navigate to="/login" replace />
            } 
          />
          
          {/* Protected Routes - Require authentication */}
          <Route 
            path="/" 
            element={
              isUserAuthenticated 
                ? (user && ['admin', 'secretary', 'priest', 'reporter'].includes(user.role) 
                    ? <Navigate to="/admin" replace /> 
                    : <Home />)
                : <Navigate to="/login" replace />
            } 
          />
          <Route path="/prayers" element={isUserAuthenticated ? <Prayers /> : <Navigate to="/login" replace />} />
          <Route path="/gallery" element={isUserAuthenticated ? <Gallery /> : <Navigate to="/login" replace />} />
          <Route path="/ministries" element={isUserAuthenticated ? <Ministries /> : <Navigate to="/login" replace />} />
          <Route path="/outreach" element={isUserAuthenticated ? <Outreach /> : <Navigate to="/login" replace />} />
          <Route path="/watch-mass" element={isUserAuthenticated ? <WatchMass /> : <Navigate to="/login" replace />} />
          <Route path="/sacraments" element={isUserAuthenticated ? <Sacraments /> : <Navigate to="/login" replace />} />
          <Route path="/calendar" element={isUserAuthenticated ? <Calendar /> : <Navigate to="/login" replace />} />
          <Route path="/contact" element={isUserAuthenticated ? <Contact /> : <Navigate to="/login" replace />} />
          <Route path="/giving" element={isUserAuthenticated ? <Giving /> : <Navigate to="/login" replace />} />
          <Route path="/news" element={isUserAuthenticated ? <News /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isUserAuthenticated ? <EnhancedProfile /> : <Navigate to="/login" replace />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={isUserAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </main>
      
      {/* Show Footer only for authenticated non-admin routes */}
      {isUserAuthenticated && !window.location.pathname.startsWith('/admin') && <Footer />}
    </>
  );
};

export default AuthenticatedApp;
