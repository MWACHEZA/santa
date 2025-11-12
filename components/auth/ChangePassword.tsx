import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import './ModernAuth.css';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingUser, setPendingUser] = useState<string>('');

  useEffect(() => {
    const pending = localStorage.getItem('pendingPasswordChangeUser');
    if (!pending) {
      navigate('/login');
      return;
    }
    setPendingUser(pending);
  }, [navigate]);

  // Password validation rules
  const validatePassword = (password: string) => {
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const isValid = Object.values(rules).every(rule => rule);
    return { isValid, rules };
  };

  const { rules } = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');

    // Validate old password is 'Password'
    if (oldPassword !== 'Password') {
      setError('Current password is incorrect');
      return;
    }

    // Validate new password
    const { isValid } = validatePassword(newPassword);
    if (!isValid) {
      setError('New password does not meet requirements');
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password in localStorage userStore
      const userStore = JSON.parse(localStorage.getItem('userStore') || '[]');
      const userIndex = userStore.findIndex((u: any) => u.username === pendingUser);
      
      if (userIndex !== -1) {
        userStore[userIndex].password = newPassword;
        userStore[userIndex].mustChangePassword = false;
        localStorage.setItem('userStore', JSON.stringify(userStore));
        
        // Clear pending password change
        localStorage.removeItem('pendingPasswordChangeUser');
        
        // Redirect to login with success message
        navigate('/login?passwordChanged=true');
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Failed to update password');
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
          <h1>Change Password</h1>
          <p>Please update your password to continue</p>
          {pendingUser && (
            <p className="user-info">User: <strong>{pendingUser}</strong></p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="oldPassword">
              <Lock size={16} />
              Current Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password (Password)"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowOldPassword(!showOldPassword)}
                tabIndex={-1}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              <Lock size={16} />
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <Lock size={16} />
              Confirm New Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <div className="requirement-list">
                <div className={`requirement ${rules.length ? 'valid' : 'invalid'}`}>
                  {rules.length ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  At least 8 characters
                </div>
                <div className={`requirement ${rules.uppercase ? 'valid' : 'invalid'}`}>
                  {rules.uppercase ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  One uppercase letter
                </div>
                <div className={`requirement ${rules.lowercase ? 'valid' : 'invalid'}`}>
                  {rules.lowercase ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  One lowercase letter
                </div>
                <div className={`requirement ${rules.number ? 'valid' : 'invalid'}`}>
                  {rules.number ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  One number
                </div>
                <div className={`requirement ${rules.special ? 'valid' : 'invalid'}`}>
                  {rules.special ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  One special character
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={isSubmitting || !validatePassword(newPassword).isValid}
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
