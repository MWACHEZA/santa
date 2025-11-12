import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import './ModernAuth.css';

interface ModernRegisterProps {
  onSwitchToLogin: () => void;
  onRegistrationSuccess: () => void;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | '';
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  section: string;
  associations: string[];
  agreeToTerms: boolean;
}

const ModernRegister: React.FC<ModernRegisterProps> = ({ 
  onSwitchToLogin, 
  onRegistrationSuccess 
}) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(1);
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
    associations: [],
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength calculation
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return strength;
    };
    
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAssociationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      associations: selectedOptions
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 2:
        return !!(formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && 
                 formData.password.length >= 8);
      case 3:
        return !!(formData.dateOfBirth && formData.gender && formData.address);
      case 4:
        return formData.agreeToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female',
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        section: formData.section,
        associations: formData.associations
      });

      if (result.success) {
        setSuccess('Registration successful!');
        setTimeout(() => {
          onRegistrationSuccess();
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#ef4444';
    if (passwordStrength < 75) return '#f59e0b';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const renderStep1 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Personal Information</h3>
        <p>Let's start with your basic details</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
              className="modern-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              required
              className="modern-input"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className="input-container">
          <Mail className="input-icon" size={20} />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
            className="modern-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <div className="input-container">
          <Phone className="input-icon" size={20} />
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
            className="modern-input"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Security Setup</h3>
        <p>Create a secure password for your account</p>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-container">
          <Lock className="input-icon" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            required
            className="modern-input"
          />
          <button
            type="button"
            className="password-toggle-modern"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {formData.password && (
          <div className="password-strength">
            <div className="strength-bar">
              <div 
                className="strength-fill" 
                style={{ 
                  width: `${passwordStrength}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}
              ></div>
            </div>
            <span 
              className="strength-text"
              style={{ color: getPasswordStrengthColor() }}
            >
              {getPasswordStrengthText()}
            </span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-container">
          <Lock className="input-icon" size={20} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
            className="modern-input"
          />
          <button
            type="button"
            className="password-toggle-modern"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {formData.confirmPassword && (
          <div className="password-match">
            {formData.password === formData.confirmPassword ? (
              <div className="match-success">
                <Check size={16} />
                <span>Passwords match</span>
              </div>
            ) : (
              <div className="match-error">
                <X size={16} />
                <span>Passwords don't match</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="password-requirements">
        <h4>Password must contain:</h4>
        <div className="requirement-list">
          <div className={`requirement ${formData.password.length >= 8 ? 'valid' : 'invalid'}`}>
            {formData.password.length >= 8 ? <Check size={16} /> : <X size={16} />}
            <span>At least 8 characters</span>
          </div>
          <div className={`requirement ${/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}`}>
            {/[A-Z]/.test(formData.password) ? <Check size={16} /> : <X size={16} />}
            <span>One uppercase letter</span>
          </div>
          <div className={`requirement ${/[a-z]/.test(formData.password) ? 'valid' : 'invalid'}`}>
            {/[a-z]/.test(formData.password) ? <Check size={16} /> : <X size={16} />}
            <span>One lowercase letter</span>
          </div>
          <div className={`requirement ${/[0-9]/.test(formData.password) ? 'valid' : 'invalid'}`}>
            {/[0-9]/.test(formData.password) ? <Check size={16} /> : <X size={16} />}
            <span>One number</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Additional Details</h3>
        <p>Help us know you better</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <div className="input-container">
            <Calendar className="input-icon" size={20} />
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
              className="modern-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <div className="input-container">
            <Users className="input-icon" size={20} />
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="modern-input"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <div className="input-container">
          <MapPin className="input-icon" size={20} />
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your address"
            required
            className="modern-input"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="emergencyContact">Emergency Contact</label>
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              type="text"
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Emergency contact name"
              className="modern-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="emergencyPhone">Emergency Phone</label>
          <div className="input-container">
            <Phone className="input-icon" size={20} />
            <input
              type="tel"
              id="emergencyPhone"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              placeholder="Emergency contact phone"
              className="modern-input"
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="section">Parish Section</label>
          <div className="input-container">
            <Users className="input-icon" size={20} />
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              className="modern-input"
            >
              <option value="">Select section (optional)</option>
              <option value="st-gabriel">St Gabriel</option>
              <option value="st-augustine">St Augustine</option>
              <option value="st-mary-magdalena">St Mary Magdalena</option>
              <option value="st-michael">St Michael</option>
              <option value="st-stephen">St Stephen</option>
              <option value="st-francis-of-assisi">St Francis of Assisi</option>
              <option value="st-monica">St Monica</option>
              <option value="st-theresa">St Theresa</option>
              <option value="st-bernadette">St Bernadette</option>
              <option value="st-philomina">St Philomina</option>
              <option value="st-peter">St Peter</option>
              <option value="st-bernard">St Bernard</option>
              <option value="st-veronica">St Veronica</option>
              <option value="st-paul">St Paul</option>
              <option value="st-luke">St Luke</option>
              <option value="st-basil">St Basil</option>
              <option value="st-anthony">St Anthony</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="associations">Associations (Multiple selections allowed)</label>
          <div className="input-container">
            <Users className="input-icon" size={20} />
            <select
              id="associations"
              name="associations"
              multiple
              value={formData.associations}
              onChange={handleAssociationChange}
              className="modern-input multi-select"
              size={6}
            >
              <option value="missionary-childhood-mca">Missionary Childhood (MCA)</option>
              <option value="catholic-junior-youth-cja">Catholic Junior Youth Association (CJA)</option>
              <option value="catholic-senior-youth-cya">Catholic Senior Youth Association (CYA)</option>
              <option value="catholic-young-adults-cyaa">Catholic Young Adults Association (CYAA)</option>
              <option value="most-sacred-heart-jesus">Most Sacred Heart of Jesus</option>
              <option value="sodality-our-lady">Sodality of Our Lady</option>
              <option value="st-anne">St Anne</option>
              <option value="st-joseph">St Joseph</option>
              <option value="couples-association">Couples Association</option>
              <option value="focolare">Focolare</option>
              <option value="womens-forum">Women's Forum</option>
              <option value="association-altar-servers">Association of Altar Servers</option>
            </select>
          </div>
          <small className="form-help">Hold Ctrl (Cmd on Mac) to select multiple associations</small>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <div className="step-header">
        <h3>Terms & Conditions</h3>
        <p>Please review and accept our terms</p>
      </div>

      <div className="terms-content">
        <div className="terms-box">
          <h4>St. Patrick's Parish Registration Terms</h4>
          <div className="terms-text">
            <p>By registering as a parishioner, you agree to:</p>
            <ul>
              <li>Provide accurate and truthful information</li>
              <li>Respect the privacy of other parishioners</li>
              <li>Follow the guidelines and values of our parish community</li>
              <li>Use the parish system responsibly and appropriately</li>
              <li>Allow us to contact you regarding parish activities and important announcements</li>
            </ul>
            <p>We are committed to protecting your privacy and will never share your personal information with third parties without your consent.</p>
          </div>
        </div>

        <label className="checkbox-container-large">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            required
          />
          <span className="checkmark-large"></span>
          <span className="checkbox-text">
            I agree to the Terms & Conditions and Privacy Policy
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="modern-auth">
      <div className="auth-background">
        <div className="bg-gradient"></div>
      </div>

      <div className="auth-container register-container">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                <div className="step-number">
                  {currentStep > step ? <Check size={16} /> : step}
                </div>
                <span className="step-label">
                  {step === 1 ? 'Personal' : 
                   step === 2 ? 'Security' : 
                   step === 3 ? 'Details' : 'Terms'}
                </span>
              </div>
            ))}
          </div>
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
        </div>

        {/* Form Panel */}
        <div className="auth-form-panel register-panel">
          <div className="form-container">
            <div className="form-header">
              <h2>Join Our Parish</h2>
              <p>Step {currentStep} of 4</p>
            </div>

            <form onSubmit={handleSubmit} className="modern-form">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

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

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button 
                    type="button" 
                    className="nav-btn prev-btn"
                    onClick={prevStep}
                  >
                    <ArrowLeft size={20} />
                    Previous
                  </button>
                )}

                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    className="nav-btn next-btn"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                  >
                    Next
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="modern-submit-btn"
                    disabled={isLoading || !validateStep(currentStep)}
                  >
                    {isLoading ? (
                      <>
                        <div className="modern-spinner"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Back to Login */}
            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <button 
              type="button"
              className="register-btn-modern secondary"
              onClick={onSwitchToLogin}
            >
              Sign In Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRegister;
