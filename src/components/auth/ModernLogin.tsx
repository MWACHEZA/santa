import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
<<<<<<< HEAD
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
=======
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
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
<<<<<<< HEAD
  const { login, register, isLoading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t } = useLanguage();
=======
  const { login, isAuthenticated, user } = useAuth();
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
  const navigate = useNavigate();
  
  const [showRegister, setShowRegister] = useState(initialShowRegister);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'parishioner' as any,
    association: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'username'>('email');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      if (showRegister) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          toastError('Passwords do not match', 'Registration Error');
          setIsSubmitting(false);
          return;
        }
        const result = await register(formData);
        if (result.success) {
          toastSuccess('Account created successfully! Please log in.', 'Welcome');
          setShowRegister(false);
        } else {
          setError(result.message || 'Registration failed');
          toastError(result.message || 'Registration failed', 'Error');
        }
      } else {
        const result = await login(formData.username, formData.password);
        if (result.success) {
          toastSuccess(`Welcome back, ${formData.username}!`, 'Login Successful');
          if (result.mustChangePassword) {
            navigate('/change-password');
          } else {
            navigate(result.role === 'parishioner' ? '/' : '/admin');
          }
        } else {
          setError(result.message || 'Invalid credentials');
          toastError(result.message || 'Invalid credentials', 'Login Failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toastError('An unexpected error occurred. Please try again.', 'System Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegister(false);
    toastSuccess('Registration successful! Please sign in with your credentials.', 'Account Created');
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
                src="/logo.svg" 
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
              <h2>{showRegister ? 'Create Account' : 'Sign In'}</h2>
              <p>{showRegister ? 'Join our community today!' : 'Welcome back! Please enter your details.'}</p>
            </div>

            {/* Login Method Selector */}
            {!showRegister && (
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
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="modern-form">
              {/* Registration Fields */}
              {showRegister && (
                <div className="registration-extra-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        placeholder="John"
                        className="modern-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        placeholder="Doe"
                        className="modern-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+263 7..."
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="johndoe"
                      className="modern-input"
                    />
                  </div>
                </div>
              )}

              {/* Identifier Input (Login Only) */}
              {!showRegister && (
                <div className="form-group">
                  <label htmlFor="identifier">
                    {loginMethod === 'email' ? 'Email Address' : 
                     loginMethod === 'phone' ? 'Phone Number' : 'Username'}
                  </label>
                  <div className="input-container">
                    {getInputIcon()}
                    <input
                      type="text"
                      id="identifier"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder={getPlaceholder()}
                      required
                      disabled={isSubmitting}
                      className="modern-input"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    className="modern-input"
                  />
                  <button
                    type="button"
                    className="password-toggle-modern"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {showRegister && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirm your password"
                      required
                      disabled={isSubmitting}
                      className="modern-input"
                    />
                  </div>
                </div>
              )}

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


              {/* Submit Button */}
                <button 
                type="submit" 
                className="modern-submit-btn"
                disabled={isSubmitting || !formData.username || !formData.password}
              >
                {isSubmitting ? (
                  <>
                    <div className="modern-spinner"></div>
                    {showRegister ? 'Creating Account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {showRegister ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="register-section-modern">
              <p>{showRegister ? 'Already have an account?' : "Don't have an account?"}</p>
              <button 
                type="button"
                className="register-btn-modern"
                onClick={() => setShowRegister(!showRegister)}
              >
                {showRegister ? 'Sign In Instead' : 'Create Account'}
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

// console.log('ModernLogin rendered');
