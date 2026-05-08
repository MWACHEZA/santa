import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  section: string;
  association: string;
  agreeToTerms: boolean;
  profilePicture?: File;
}

interface RegisterProps {
  onSwitchToLogin?: () => void;
  onRegistrationSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegistrationSuccess }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    section: '',
    association: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.agreeToTerms) {
      (newErrors as any).agreeToTerms = 'You must agree to the terms and conditions';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (Zimbabwe format)
    const phoneRegex = /^(\+263|0)(7[0-9]|8[6-9])[0-9]{7}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Zimbabwe phone number (e.g., +263771234567 or 0771234567)';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Age validation (must be at least 13 years old)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old to register';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }

      // Set the file
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicturePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please correct the errors below' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Prepare registration data
      const registrationData: any = {
        username: (formData.email.trim().toLowerCase().split('@')[0] || formData.phone.replace(/\s/g, '') || `${formData.firstName}${formData.lastName}`).toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s/g, ''), // Remove spaces
        password: formData.password,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender as 'male' | 'female') || undefined,
        address: formData.address.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.replace(/\s/g, '') || undefined,
        section: formData.section || undefined,
        association: formData.association || undefined,
        role: 'parishioner' as const // Automatically set as parishioner
      };

      // Add profile picture if selected
      if (formData.profilePicture) {
        registrationData.profilePicture = formData.profilePicture;
      }

      const result = await register(registrationData);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Please sign in with your credentials.' 
        });
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          dateOfBirth: '',
          gender: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: '',
          section: '',
          association: '',
          agreeToTerms: false
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          if (onRegistrationSuccess) {
            onRegistrationSuccess();
          } else {
            navigate('/login');
          }
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Registration failed. Please try again.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during registration. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="church-logo">
            <img src="/api/placeholder/60/60" alt="St. Patrick's Catholic Church" />
          </div>
          <h2>Join Our Parish Community</h2>
          <p>Register to become a member of St. Patrick's Catholic Church</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '⚠️'}
            </span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>

            {/* Profile Picture Upload */}
            <div className="form-group">
              <label>Profile Picture (Optional)</label>
              <div className="profile-picture-upload">
                <div className="profile-picture-preview">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile Preview" className="preview-image" />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>👤</span>
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
                <div className="upload-controls">
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profilePicture" className="btn-upload">
                    Choose Photo
                  </label>
                  <p className="help-text">JPG, PNG, GIF (Max 5MB)</p>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={errors.dateOfBirth ? 'error' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+263771234567 or 0771234567"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Your residential address"
                rows={3}
              />
            </div>
          </div>

          {/* Parish Information */}
          <div className="form-section">
            <h3>Parish Information (Optional)</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="section">Parish Section</label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className={errors.section ? 'error' : ''}
                >
                  <option value="">Select Section</option>
                  <option value="St Gabriel">St Gabriel</option>
                  <option value="St Augustine">St Augustine</option>
                  <option value="St Mary Magdalena">St Mary Magdalena</option>
                  <option value="St Michael">St Michael</option>
                  <option value="St Stephen">St Stephen</option>
                  <option value="St Francis of Assisi">St Francis of Assisi</option>
                  <option value="St Monica">St Monica</option>
                  <option value="St Theresa">St Theresa</option>
                  <option value="St Bernadette">St Bernadette</option>
                  <option value="St Philomina">St Philomina</option>
                  <option value="St Peter">St Peter</option>
                  <option value="St Bernard">St Bernard</option>
                  <option value="St Veronica">St Veronica</option>
                  <option value="St Paul">St Paul</option>
                  <option value="St Luke">St Luke</option>
                  <option value="St Basil">St Basil</option>
                  <option value="St Anthony">St Anthony</option>
                </select>
                {errors.section && <span className="error-text">{errors.section}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="association">Association</label>
                <select
                  id="association"
                  name="association"
                  value={formData.association}
                  onChange={handleInputChange}
                  className={errors.association ? 'error' : ''}
                >
                  <option value="">Select Association</option>
                  <option value="Missionary Childhood (MCA)">Missionary Childhood (MCA)</option>
                  <option value="Catholic Junior Youth Association (CJA)">Catholic Junior Youth Association (CJA)</option>
                  <option value="Catholic Senior Youth Association (CYA)">Catholic Senior Youth Association (CYA)</option>
                  <option value="Catholic Young Adults Association (CYAA)">Catholic Young Adults Association (CYAA)</option>
                  <option value="Most Sacred Heart of Jesus">Most Sacred Heart of Jesus</option>
                  <option value="Sodality of Our Lady">Sodality of Our Lady</option>
                  <option value="St Anne">St Anne</option>
                  <option value="St Joseph">St Joseph</option>
                  <option value="Couples Association">Couples Association</option>
                  <option value="Focolare">Focolare</option>
                  <option value="Women's Forum">Women's Forum</option>
                  <option value="Association of Altar Servers">Association of Altar Servers</option>
                </select>
                {errors.association && <span className="error-text">{errors.association}</span>}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-section">
            <h3>Emergency Contact (Optional)</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContact">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Full name of emergency contact"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyPhone">Emergency Contact Phone</label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  placeholder="+263771234567"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="form-section">
            <h3>Account Security</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="At least 6 characters"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="form-section">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={errors.agreeToTerms ? 'error' : ''}
                />
                <span className="checkmark"></span>
                I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> and 
                <a href="/privacy" target="_blank"> Privacy Policy</a> of St. Patrick's Catholic Church
              </label>
              {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : (
                'Register as Parishioner'
              )}
            </button>
          </div>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button 
                type="button" 
                onClick={onSwitchToLogin}
                className="link-button"
              >
                Sign In Here
              </button>
            ) : (
              <Link to="/login" className="link-button">
                Sign In Here
              </Link>
            )}
          </p>
          
          <div className="help-text">
            <p>
              <strong>Need Help?</strong><br />
              Contact the parish office at <a href="tel:+263912345678">+263 9 123456</a><br />
              or email <a href="mailto:info@stpatricksmakokoba.org">info@stpatricksmakokoba.org</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
