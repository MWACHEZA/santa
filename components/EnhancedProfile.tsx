import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Mail, Phone, Calendar, MapPin, UserCheck, Save, Edit, X, 
  Heart, Church, Users, Crown, BookOpen, Award 
} from 'lucide-react';
import './EnhancedProfile.css';

const EnhancedProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
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
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      if (!updateUser) {
        throw new Error('Update function not available');
      }

      const result = updateUser(user.id, {
        ...formData,
        gender: formData.gender as 'male' | 'female' | undefined,
        updatedAt: new Date().toISOString()
      });

      if (result && result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        throw new Error(result?.message || 'Failed to update profile');
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
    required: boolean = false
  ) => (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <div className="radio-group">
        <label className="radio-option">
          <input
            type="radio"
            name={name}
            value="true"
            checked={value === true}
            onChange={handleInputChange}
            disabled={!isEditing}
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
            disabled={!isEditing}
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
          <User size={48} />
        </div>
        <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
        <p className="profile-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        
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
                  <User size={16} />
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                disabled={!isEditing}
                rows={3}
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
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parish' && user.role === 'parishioner' && (
          <div className="tab-content">
            <h3>Parish Membership</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Users size={16} />
                  Association (Optional)
                </label>
                <input
                  type="text"
                  name="association"
                  value={formData.association}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Catholic Women's League, Knights of Columbus"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Church size={16} />
                  Section (Optional)
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Youth Section, Adult Section"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sacraments' && user.role === 'parishioner' && (
          <div className="tab-content">
            <h3>Sacramental Life</h3>
            
            {/* Baptism */}
            <div className="sacrament-section">
              <h4>Baptism</h4>
              {renderBooleanField('isBaptized', 'Are you baptized?', formData.isBaptized, true)}
              
              {formData.isBaptized === true && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Baptism Date</label>
                    <input
                      type="date"
                      name="baptismDate"
                      value={formData.baptismDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Baptism Venue</label>
                    <input
                      type="text"
                      name="baptismVenue"
                      value={formData.baptismVenue}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="sacrament-section">
              <h4>Confirmation</h4>
              {renderBooleanField('isConfirmed', 'Are you confirmed?', formData.isConfirmed, true)}
              
              {formData.isConfirmed === true && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Confirmation Date</label>
                    <input
                      type="date"
                      name="confirmationDate"
                      value={formData.confirmationDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmation Venue</label>
                    <input
                      type="text"
                      name="confirmationVenue"
                      value={formData.confirmationVenue}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Holy Communion */}
            <div className="sacrament-section">
              <h4>Holy Communion</h4>
              {renderBooleanField('receivesCommunion', 'Do you receive Holy Communion?', formData.receivesCommunion, true)}
              
              {formData.receivesCommunion === true && (
                <div className="form-group">
                  <label className="form-label">First Communion Date</label>
                  <input
                    type="date"
                    name="firstCommunionDate"
                    value={formData.firstCommunionDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              )}
            </div>

            {/* Marriage */}
            <div className="sacrament-section">
              <h4>Marriage</h4>
              {renderBooleanField('isMarried', 'Are you married?', formData.isMarried, true)}
              
              {formData.isMarried === true && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Spouse Name</label>
                      <input
                        type="text"
                        name="spouseName"
                        value={formData.spouseName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Full name of spouse"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marriage Date</label>
                      <input
                        type="date"
                        name="marriageDate"
                        value={formData.marriageDate}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marriage Venue</label>
                    <input
                      type="text"
                      name="marriageVenue"
                      value={formData.marriageVenue}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'priest' && user.role === 'priest' && (
          <div className="tab-content">
            <h3>Priestly Information</h3>
            
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
                disabled={!isEditing}
                required={user.role === 'priest'}
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
                disabled={!isEditing}
                required={user.role === 'priest'}
                placeholder="Church or Cathedral where ordained"
              />
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
                disabled={!isEditing}
                required={user.role === 'priest'}
                placeholder="Name of ordaining Bishop or Priest"
              />
            </div>
          </div>
        )}
      </form>
      </div>
    </div>
  );
};

export default EnhancedProfile;
