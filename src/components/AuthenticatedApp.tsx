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

  // Debug logging
  console.log('🔍 AuthenticatedApp render:', {
    isUserAuthenticated,
    user: user?.username,
    userRole: user?.role,
    authLoading,
    adminLoading,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // Additional debugging for blank screen
  if (!authLoading && !adminLoading && !isUserAuthenticated) {
    console.log('🚨 Not authenticated, should redirect to login');
  }
  
  if (!authLoading && !adminLoading && isUserAuthenticated) {
    console.log('✅ Authenticated, should show app content');
  }

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
    console.log('🔄 Showing loading screen:', { authLoading, adminLoading });
    return (
      <div className="loading-container" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'white', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#4a90e2' }}>
          {authLoading ? 'Checking authentication...' : 'Loading application...'}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          Debug: authLoading={authLoading.toString()}, adminLoading={adminLoading.toString()}
        </p>
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
    console.log('🔄 Redirecting authenticated user to:', defaultRoute);
    return <Navigate to={defaultRoute} replace />;
  }

  // If authenticated but on root path, redirect to appropriate dashboard
  if (isUserAuthenticated && window.location.pathname === '/') {
    const defaultRoute = getDefaultRoute(user?.role || 'parishioner');
    console.log('🔄 Redirecting from root to:', defaultRoute);
    
    // For parishioners, don't redirect from root - let them stay on home page
    if (user?.role === 'parishioner') {
      console.log('✅ Parishioner on home page, no redirect needed');
      // Don't redirect, let them see the home page
    } else {
      return <Navigate to={defaultRoute} replace />;
    }
  }

  return (
    <div key={`auth-${isUserAuthenticated}-${user?.id}`} style={{ minHeight: '100vh', overflow: 'auto' }}>
      {/* Show Header and Footer only for authenticated non-admin routes */}
      {isUserAuthenticated && !window.location.pathname.startsWith('/admin') && <Header />}
      
      <main style={{ minHeight: '100vh', overflow: 'auto', paddingBottom: '2rem' }}>
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
          <Route path="*" element={
            <Navigate to={
              isUserAuthenticated 
                ? getDefaultRoute(user?.role || 'parishioner')
                : "/login"
            } replace />
          } />
        </Routes>
      </main>
      
      {/* Show Footer only for authenticated non-admin routes */}
      {isUserAuthenticated && !window.location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
};

export default AuthenticatedApp;
