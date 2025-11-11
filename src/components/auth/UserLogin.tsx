import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './ModernAuth.css';

const UserLogin: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('passwordChanged') === 'true') {
      setSuccess('Password updated successfully! Please log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(username, password);
      if (result.success) {
        if (result.mustChangePassword) {
          // Redirect to change password page
          navigate('/change-password', { replace: true });
        } else {
          // Redirect based on user role
          const role = result.role;
          if (role && ['admin', 'secretary', 'priest', 'reporter'].includes(role)) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } else {
        setError(result.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src="/api/placeholder/80/80" 
              alt="St. Patrick's Logo" 
              className="logo-img"
            />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <User size={16} />
              Username, Email, or Phone
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username, email, or phone"
              required
              disabled={isSubmitting || isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isSubmitting || isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
