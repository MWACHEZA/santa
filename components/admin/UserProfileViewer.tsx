import React, { useState } from 'react';
import { User } from '../../contexts/AuthContext';
import { 
  User as UserIcon, Mail, Phone, Calendar, MapPin, UserCheck, Save, Edit, X, 
  Heart, Church, Users, Crown, BookOpen, Award 
} from 'lucide-react';
import '../EnhancedProfile.css';

interface UserProfileViewerProps {
  user: User;
  onUserUpdate?: (updatedUser: User) => void;
  isReadOnly?: boolean;
}

const UserProfileViewer: React.FC<UserProfileViewerProps> = ({ 
  user, 
  onUserUpdate, 
  isReadOnly = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'parish' | 'sacraments' | 'priest'>('basic');
  
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
    
    // Parish Membership (optional for parishioners)
    association: user?.association || '',
    section: user?.section || '',
    
    // Sacramental Information (for parishioners)
    isBaptized: user?.isBaptized ?? null,
    baptismDate: user?.baptismDate || '',
    baptismVenue: user?.baptismVenue || '',
    isConfirmed: user?.isConfirmed ?? null,
    confirmationDate: user?.confirmationDate || '',
    confirmationVenue: user?.confirmationVenue || '',
    receivesCommunion: user?.receivesCommunion ?? null,
    firstCommunionDate: user?.firstCommunionDate || '',
    isMarried: user?.isMarried ?? null,
    marriageDate: user?.marriageDate || '',
    marriageVenue: user?.marriageVenue || '',
    spouseName: user?.spouseName || '',
    
    // Priest-specific Information (for priests only)
    ordinationDate: user?.ordinationDate || '',
    ordinationVenue: user?.ordinationVenue || '',
    ordainedBy: user?.ordainedBy || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      const radioValue = value === 'true' ? true : value === 'false' ? false : null;
      setFormData(prev => ({
        ...prev,
        [name]: radioValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isReadOnly) return;

    setLoading(true);
    setMessage(null);

    try {
      const updatedUser = {
        ...user,
        ...formData,
        gender: formData.gender as 'male' | 'female' | undefined,
        updatedAt: new Date().toISOString()
      };

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || '',
      association: user?.association || '',
      section: user?.section || '',
      isBaptized: user?.isBaptized ?? null,
      baptismDate: user?.baptismDate || '',
      baptismVenue: user?.baptismVenue || '',
      isConfirmed: user?.isConfirmed ?? null,
      confirmationDate: user?.confirmationDate || '',
      confirmationVenue: user?.confirmationVenue || '',
      receivesCommunion: user?.receivesCommunion ?? null,
      firstCommunionDate: user?.firstCommunionDate || '',
      isMarried: user?.isMarried ?? null,
      marriageDate: user?.marriageDate || '',
      marriageVenue: user?.marriageVenue || '',
      spouseName: user?.spouseName || '',
      ordinationDate: user?.ordinationDate || '',
      ordinationVenue: user?.ordinationVenue || '',
      ordainedBy: user?.ordainedBy || ''
    });
    setIsEditing(false);
    setMessage(null);
  };

  if (!user) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const renderBooleanField = (
    name: string, 
    label: string, 
    value: boolean | null, 
    icon: React.ReactNode
  ) => (
    <div className="form-group">
      <label className="form-label">
        {icon}
        {label}
      </label>
      <div className="radio-group">
        <label className="radio-option">
          <input
            type="radio"
            name={name}
            value="true"
            checked={value === true}
            onChange={handleInputChange}
            disabled={!isEditing || isReadOnly}
          />
          <span>Yes</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name={name}
            value="false"
            checked={value === false}
            onChange={handleInputChange}
            disabled={!isEditing || isReadOnly}
          />
          <span>No</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="enhanced-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <UserIcon size={48} />
        </div>
        <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
        <p className="profile-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        
        {!isReadOnly && (
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="action-btn"
                onClick={() => setIsEditing(true)}
              >
                <Edit size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  className="action-btn save"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="action-btn cancel"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="profile-content">
        {message && (
          <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.text}
          </div>
        )}

        <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <UserCheck size={16} />
          Basic Information
        </button>
        
        {user.role === 'parishioner' && (
          <>
            <button 
              className={`tab-button ${activeTab === 'parish' ? 'active' : ''}`}
              onClick={() => setActiveTab('parish')}
            >
              <Church size={16} />
              Parish Membership
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'sacraments' ? 'active' : ''}`}
              onClick={() => setActiveTab('sacraments')}
            >
              <Heart size={16} />
              Sacramental Life
            </button>
          </>
        )}
        
        {user.role === 'priest' && (
          <button 
            className={`tab-button ${activeTab === 'priest' ? 'active' : ''}`}
            onClick={() => setActiveTab('priest')}
          >
            <Crown size={16} />
            Priestly Information
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {activeTab === 'basic' && (
          <div className="tab-content">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={16} />
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={16} />
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                />
                {formData.dateOfBirth && (
                  <small style={{ color: '#6c757d', marginTop: '0.25rem' }}>
                    Age: {calculateAge(formData.dateOfBirth) || 'Unknown'}
                  </small>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <UserCheck size={16} />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  className="form-input"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing || isReadOnly}
                rows={3}
                className="form-input form-textarea"
              />
            </div>

            <h4>Emergency Contact</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Name</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parish' && user.role === 'parishioner' && (
          <div className="tab-content">
            <h3>Parish Membership Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Association
                </label>
                <select
                  name="association"
                  value={formData.association}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  className="form-input"
                >
                  <option value="">Select Association</option>
                  <option value="Catholic Women League">Catholic Women League</option>
                  <option value="Knights of Columbus">Knights of Columbus</option>
                  <option value="Youth Ministry">Youth Ministry</option>
                  <option value="Choir">Choir</option>
                  <option value="Legion of Mary">Legion of Mary</option>
                  <option value="St. Vincent de Paul">St. Vincent de Paul</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Church size={16} />
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  className="form-input"
                >
                  <option value="">Select Section</option>
                  <option value="St. Mary">St. Mary</option>
                  <option value="St. Joseph">St. Joseph</option>
                  <option value="St. Peter">St. Peter</option>
                  <option value="St. Paul">St. Paul</option>
                  <option value="St. John">St. John</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sacraments' && user.role === 'parishioner' && (
          <div className="tab-content">
            <h3>Sacramental Life</h3>
            
            <div className="form-section">
              <h4 className="section-title">
                <Heart size={20} />
                Baptism
              </h4>
              
              {renderBooleanField('isBaptized', 'Baptized', formData.isBaptized, <Heart size={16} />)}
              
              {formData.isBaptized && (
                <div className="conditional-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Baptism Date</label>
                      <input
                        type="date"
                        name="baptismDate"
                        value={formData.baptismDate}
                        onChange={handleInputChange}
                        disabled={!isEditing || isReadOnly}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Baptism Venue</label>
                      <input
                        type="text"
                        name="baptismVenue"
                        value={formData.baptismVenue}
                        onChange={handleInputChange}
                        disabled={!isEditing || isReadOnly}
                        placeholder="Church name and location"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4 className="section-title">
                <Award size={20} />
                Confirmation
              </h4>
              
              {renderBooleanField('isConfirmed', 'Confirmed', formData.isConfirmed, <Award size={16} />)}
              
              {formData.isConfirmed && (
                <div className="conditional-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Confirmation Date</label>
                      <input
                        type="date"
                        name="confirmationDate"
                        value={formData.confirmationDate}
                        onChange={handleInputChange}
                        disabled={!isEditing || isReadOnly}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirmation Venue</label>
                      <input
                        type="text"
                        name="confirmationVenue"
                        value={formData.confirmationVenue}
                        onChange={handleInputChange}
                        disabled={!isEditing || isReadOnly}
                        placeholder="Church name and location"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4 className="section-title">
                <BookOpen size={20} />
                First Communion
              </h4>
              
              {renderBooleanField('receivesCommunion', 'Receives Communion', formData.receivesCommunion, <BookOpen size={16} />)}
              
              {formData.receivesCommunion && (
                <div className="conditional-fields">
                  <div className="form-group">
                    <label className="form-label">First Communion Date</label>
                    <input
                      type="date"
                      name="firstCommunionDate"
                      value={formData.firstCommunionDate}
                      onChange={handleInputChange}
                      disabled={!isEditing || isReadOnly}
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h4 className="section-title">
                <Heart size={20} />
                Marriage
              </h4>
              
              {renderBooleanField('isMarried', 'Married', formData.isMarried, <Heart size={16} />)}
              
              {formData.isMarried && (
                <div className="conditional-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Marriage Date</label>
                      <input
                        type="date"
                        name="marriageDate"
                        value={formData.marriageDate}
                        onChange={handleInputChange}
                        disabled={!isEditing || isReadOnly}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marriage Venue</label>
                      <input
                        type="text"
                        name="marriageVenue"
                        value={formData.marriageVenue}
                        onChange={handleInputChange}
                        disabled={!isEditing || isReadOnly}
                        placeholder="Church name and location"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Spouse Name</label>
                    <input
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleInputChange}
                      disabled={!isEditing || isReadOnly}
                      placeholder="Full name of spouse"
                      className="form-input"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'priest' && user.role === 'priest' && (
          <div className="tab-content">
            <div className="priest-only-notice">
              <Crown size={20} />
              <span>Priestly Information - This section is only visible to priests</span>
            </div>
            
            <h3>Ordination Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Ordination Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="ordinationDate"
                  value={formData.ordinationDate}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  required={user.role === 'priest'}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Church size={16} />
                  Ordination Venue <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="ordinationVenue"
                  value={formData.ordinationVenue}
                  onChange={handleInputChange}
                  disabled={!isEditing || isReadOnly}
                  required={user.role === 'priest'}
                  placeholder="Cathedral or Church name and location"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Crown size={16} />
                Ordained By <span className="required">*</span>
              </label>
              <input
                type="text"
                name="ordainedBy"
                value={formData.ordainedBy}
                onChange={handleInputChange}
                disabled={!isEditing || isReadOnly}
                required={user.role === 'priest'}
                placeholder="Name of ordaining Bishop or Priest"
                className="form-input"
              />
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
};

export default UserProfileViewer;
