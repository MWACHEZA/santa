import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone,
  ArrowRight,
  Sparkles,
  Shield,
  Heart
} from 'lucide-react';
import ModernRegister from './ModernRegister';
import './ModernAuth.css';

interface ModernLoginProps {
  initialShowRegister?: boolean;
}

const ModernLogin: React.FC<ModernLoginProps> = ({ initialShowRegister = false }) => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(initialShowRegister);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'username'>('email');

  // Navigate after successful authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🚀 User authenticated, navigating...', user.role);
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
      
      const defaultRoute = getDefaultRoute(user.role);
      console.log('🔄 Navigating to:', defaultRoute);
      
      // Use setTimeout to ensure state updates are complete
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await login(identifier, password);
      
      if (result.success) {
        setSuccess(result.message || 'Welcome back!');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegister(false);
    setSuccess('Registration successful! Please sign in with your credentials.');
  };

  if (showRegister) {
    return (
      <ModernRegister 
        onSwitchToLogin={() => setShowRegister(false)}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    );
  }

  const getInputIcon = () => {
    switch (loginMethod) {
      case 'email': return <Mail className="input-icon" size={20} />;
      case 'phone': return <Phone className="input-icon" size={20} />;
      default: return <User className="input-icon" size={20} />;
    }
  };

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'email': return 'Enter your email address';
      case 'phone': return 'Enter your phone number';
      default: return 'Enter your username';
    }
  };

  return (
    <div className="modern-auth">
      {/* Background Elements */}
      <div className="auth-background">
        <div className="bg-gradient"></div>
        <div className="floating-elements">
          <div className="floating-element element-1">
            <Heart size={24} />
          </div>
          <div className="floating-element element-2">
            <Sparkles size={20} />
          </div>
          <div className="floating-element element-3">
            <Shield size={22} />
          </div>
        </div>
      </div>

      <div className="auth-container">
        {/* Left Panel - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="church-logo-modern">
              <img 
                src="/api/placeholder/120/120" 
                alt="St. Patrick's Catholic Church" 
                className="logo-image-modern"
              />
              <div className="logo-glow"></div>
            </div>
            
            <h1 className="brand-title">
              Welcome to <br />
              <span className="gradient-text">St. Patrick's</span>
            </h1>
            
            <p className="brand-subtitle">
              Your spiritual home in Makokoba, Bulawayo
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>Secure & Private</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>Community Connected</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={16} />
                <span>Faith Centered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="auth-form-panel">
          <div className="form-container">
            {/* Header */}
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Welcome back! Please enter your details.</p>
            </div>

            {/* Login Method Selector */}
            <div className="login-method-selector">
              <button
                type="button"
                className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => setLoginMethod('email')}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                type="button"
                className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setLoginMethod('phone')}
              >
                <Phone size={16} />
                Phone
              </button>
              <button
                type="button"
                className={`method-btn ${loginMethod === 'username' ? 'active' : ''}`}
                onClick={() => setLoginMethod('username')}
              >
                <User size={16} />
                Username
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="modern-form">
              {/* Identifier Input */}
              <div className="form-group">
                <label htmlFor="identifier">
                  {loginMethod === 'email' ? 'Email Address' : 
                   loginMethod === 'phone' ? 'Phone Number' : 'Username'}
                </label>
                <div className="input-container">
                  {getInputIcon()}
                  <input
                    type={loginMethod === 'email' ? 'email' : 'text'}
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={getPlaceholder()}
                    required
                    disabled={isLoading}
                    className="modern-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="modern-input"
                  />
                  <button
                    type="button"
                    className="password-toggle-modern"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-container">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <button type="button" className="forgot-password">
                  Forgot password?
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="message error-message-modern">
                  <XCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="message success-message-modern">
                  <CheckCircle size={20} />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="modern-submit-btn"
                disabled={isLoading || !identifier || !password}
              >
                {isLoading ? (
                  <>
                    <div className="modern-spinner"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            {/* Register Section */}
            <div className="register-section-modern">
              <p>Don't have an account?</p>
              <button 
                type="button"
                className="register-btn-modern"
                onClick={() => setShowRegister(true)}
              >
                Create Account
              </button>
            </div>

            {/* Footer */}
            <div className="form-footer">
              <p>
                By signing in, you agree to our{' '}
                <button type="button" className="link">Terms of Service</button>{' '}
                and{' '}
                <button type="button" className="link">Privacy Policy</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
