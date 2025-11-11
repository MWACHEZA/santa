import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { Lock, User, Eye, EyeOff, User as UserIcon, Clipboard, BookOpen, Camera, Home as HomeIcon } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const { login, isLoading: isAuthLoading, user } = useAuth();
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } else if (user && user.role === 'parishioner') {
      // Parishioners should go to home page, not admin dashboard
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.message || 'Invalid username or password');
      }
      // Navigation is handled by the useEffect when isAuthenticated changes
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill credentials based on role
  const fillCredentials = (role: 'admin' | 'secretary' | 'priest' | 'reporter' | 'parishioner' | 'vice_secretary') => {
    setError(''); // Clear any previous errors
    switch (role) {
      case 'admin':
        setUsername('admin');
        setPassword('admin123');
        break;
      case 'secretary':
        setUsername('secretary');
        setPassword('secretary123');
        break;
      case 'priest':
        setUsername('priest');
        setPassword('priest123');
        break;
      case 'reporter':
        setUsername('reporter');
        setPassword('reporter123');
        break;
      case 'parishioner':
        setUsername('parishioner');
        setPassword('parishioner123');
        break;
    }
    setError('');
  };

  return (
    <div className="admin-login">
      <div className="login-container">
        <div className="login-header">
          <div className="church-logo">
            <span className="cross">✝</span>
          </div>
          <h1>St. Patrick's Admin</h1>
          <p>Parish Management System</p>
        </div>

        <div className="quick-login-buttons">
          <button 
            type="button" 
            className="quick-btn admin" 
            onClick={() => fillCredentials('admin')}
            title="Login as Administrator"
          >
            <UserIcon size={16} /> Admin
          </button>
          <button 
            type="button" 
            className="quick-btn secretary" 
            onClick={() => fillCredentials('secretary')}
            title="Login as Secretary"
          >
            <Clipboard size={16} /> Secretary
          </button>
          <button 
            type="button" 
            className="quick-btn priest" 
            onClick={() => fillCredentials('priest')}
            title="Login as Priest"
          >
            <BookOpen size={16} /> Priest
          </button>
          <button 
            type="button" 
            className="quick-btn reporter" 
            onClick={() => fillCredentials('reporter')}
            title="Login as Reporter"
          >
            <Camera size={16} /> Reporter
          </button>
          <button 
            type="button" 
            className="quick-btn parishioner" 
            onClick={() => fillCredentials('parishioner')}
            title="Login as Parishioner"
          >
            <HomeIcon size={16} /> Parishioner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isAuthLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isAuthLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isAuthLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`login-btn ${isSubmitting || isAuthLoading ? 'loading' : ''}`}
            disabled={isSubmitting || isAuthLoading}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-info">
          <h3>Default Credentials</h3>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> stpatricks2024</p>
          <small>Please change these credentials in production</small>
        </div>

        <div className="login-footer">
          <p>&copy; 2024 St. Patrick's Catholic Church</p>
          <p>Makokoba, Bulawayo, Zimbabwe</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
