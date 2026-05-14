import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, User as UserType } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  User, Mail, Phone, Calendar, MapPin, UserCheck, Save, Edit, X, 

  Heart, Church, Users, Crown, Award 

} from 'lucide-react';
import './EnhancedProfile.css';

const EnhancedProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const saveProfile = useCallback(async (updates: Partial<UserType>) => {
    if (!user) return { success: false, message: 'No user' };
    return await updateUser(user.id, updates);
  }, [user, updateUser]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'parish' | 'sacraments' | 'priest'>('basic');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const toDateInput = (v?: string) => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d.getTime())) return v.slice(0, 10);
    return d.toISOString().slice(0, 10);
  };
  
  const parseBool = (val: any): boolean | null => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      if (val.toLowerCase() === 'true') return true;
      if (val.toLowerCase() === 'false') return false;
    }
    return !!val;
  };

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profilePicture: null as File | null,
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
    committeePosition: user?.committeePosition || '',
    role: user?.role || 'parishioner',
    
    // Sacramental Information (for parishioners)
    isBaptized: parseBool(user?.isBaptized),
    baptismDate: user?.baptismDate || '',
    baptismVenue: user?.baptismVenue || '',
    
    isConfirmed: parseBool(user?.isConfirmed),
    confirmationDate: user?.confirmationDate || '',
    confirmationVenue: user?.confirmationVenue || '',
    
    receivesCommunion: parseBool(user?.receivesCommunion),
    firstCommunionDate: user?.firstCommunionDate || '',
    
    isMarried: parseBool(user?.isMarried),
    marriageDate: user?.marriageDate || '',
    marriageVenue: user?.marriageVenue || '',
    spouseName: user?.spouseName || '',
    
    // Priest-specific Information (for priests only)
    ordinationDate: user?.ordinationDate || '',
    ordinationVenue: user?.ordinationVenue || '',
    ordainedBy: user?.ordainedBy || ''
  });

  
  const [loading, setLoading] = useState(false);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [associationsList, setAssociationsList] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const secRes = await api.sections.getAll();
        if (secRes.success && secRes.data) {
          setSectionsList(secRes.data.sections || []);
        }
        const assocRes = await api.associations.getAll();
        if (assocRes.success && assocRes.data) {
          setAssociationsList(assocRes.data.associations || []);
        }
      } catch (e) {
        console.error('Failed to fetch dropdowns', e);
      }
    };
    fetchDropdowns();
  }, []);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mapUserToForm = useCallback((u: UserType | null) => {
    return {
      firstName: u?.firstName || '',
      lastName: u?.lastName || '',
      profilePicture: null as File | null,
      email: u?.email || '',
      phone: u?.phone || '',
      dateOfBirth: u?.dateOfBirth || '',
      gender: u?.gender || '',
      address: u?.address || '',
      emergencyContact: u?.emergencyContact || '',
      emergencyPhone: u?.emergencyPhone || '',
      association: u?.association || '',
      section: u?.section || '',
      committeePosition: u?.committeePosition || '',
      role: u?.role || 'parishioner',
      isBaptized: parseBool(u?.isBaptized),
      baptismDate: u?.baptismDate || '',
      baptismVenue: u?.baptismVenue || '',
      isConfirmed: parseBool(u?.isConfirmed),
      confirmationDate: u?.confirmationDate || '',
      confirmationVenue: u?.confirmationVenue || '',
      receivesCommunion: parseBool(u?.receivesCommunion),
      firstCommunionDate: u?.firstCommunionDate || '',
      isMarried: parseBool(u?.isMarried),
      marriageDate: u?.marriageDate || '',
      marriageVenue: u?.marriageVenue || '',
      spouseName: u?.spouseName || '',
      ordinationDate: u?.ordinationDate || '',
      ordinationVenue: u?.ordinationVenue || '',
      ordainedBy: u?.ordainedBy || ''
    };
  }, []);

  useEffect(() => {
    setFormData(mapUserToForm(user));
  }, [user, mapUserToForm]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePicture: e.target.files![0]
      }));
    }
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
      if (!saveProfile) {
        throw new Error('Save function not available');
      }


      let updatedRole = formData.role;
      if (formData.committeePosition === 'Treasurer') updatedRole = 'treasurer';
      else if (formData.committeePosition === 'Secretary') updatedRole = 'secretary';
      else if (formData.committeePosition === 'Vice Secretary') updatedRole = 'vice_secretary';
      else if (formData.committeePosition === 'Chairperson' || formData.committeePosition === 'Vice Chairperson') updatedRole = 'admin';
      else if (!formData.committeePosition) updatedRole = 'parishioner';

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'profilePicture') {
          if (val) formDataToSend.append('profilePicture', val as File);
        } else if (val !== null && val !== undefined && val !== '') {
          formDataToSend.append(key, String(val));
        }

      });
      formDataToSend.append('isCommitteeMember', String(!!formData.committeePosition && formData.committeePosition !== ''));
      formDataToSend.append('role', updatedRole as string);
      if (formData.gender) formDataToSend.append('gender', formData.gender);
      formDataToSend.append('updatedAt', new Date().toISOString());

      const result = await updateUser(user.id, formDataToSend);

      if (result && result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        
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
      profilePicture: null as File | null,
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      address: user?.address || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || '',
      association: user?.association || '',
      section: user?.section || '',
      committeePosition: user?.committeePosition || '',
      role: user?.role || 'parishioner',
      isBaptized: parseBool(user?.isBaptized),
      baptismDate: user?.baptismDate || '',
      baptismVenue: user?.baptismVenue || '',
      isConfirmed: parseBool(user?.isConfirmed),
      confirmationDate: user?.confirmationDate || '',
      confirmationVenue: user?.confirmationVenue || '',
      receivesCommunion: parseBool(user?.receivesCommunion),
      firstCommunionDate: user?.firstCommunionDate || '',
      isMarried: parseBool(user?.isMarried),
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
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Profile picture'}
            />
          ) : (
            <User size={48} />
          )}
          <div className={`profile-avatar-actions ${avatarUploading ? 'uploading' : ''}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarUploading(true);
                setAvatarMessage(null);
                try {
                  const up = await api.upload.uploadSingle(file, 'profile');
                  const url = (up.data as any)?.url || (up.data as any)?.file?.url || (up.data as any)?.path || (up as any)?.url;
                  if (!url) throw new Error('Upload failed');
                  const res = await saveProfile({ profilePictureUrl: url });
                  if (res.success) {
                    setAvatarMessage({ type: 'success', text: 'Profile picture updated' });
                  } else {
                    throw new Error(res.message || 'Failed to update profile picture');
                  }
                } catch (err) {
                  setAvatarMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
                } finally {
                  setAvatarUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />
            {avatarUploading ? (
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>Uploading...</span>
            ) : (
              <>
                <button 
                  className="avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  title="Change profile picture"
                >Change</button>
                {user.profilePictureUrl && (
                  <button 
                    className="avatar-btn remove"
                    onClick={async () => {
                      setAvatarUploading(true);
                      setAvatarMessage(null);
                      try {
                        const res = await saveProfile({ profilePictureUrl: '' });
                        if (res.success) {
                          setAvatarMessage({ type: 'success', text: 'Profile picture removed' });
                        } else {
                          throw new Error(res.message || 'Failed to remove profile picture');
                        }
                      } catch (err) {
                        setAvatarMessage({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed' });
                      } finally {
                        setAvatarUploading(false);
                      }
                    }}
                    disabled={avatarUploading}
                    title="Remove profile picture"
                  >Remove</button>
                )}
              </>
            )}
          </div>
        </div>
        <h1 className="profile-name">{user.firstName} {user.lastName}</h1>

        {/* Position badge — shows for committee members on parishioner side */}
        {user.committeePosition ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #2d5016 0%, #4a8022 100%)',
              color: '#fff',
              borderRadius: '999px',
              padding: '0.35rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              boxShadow: '0 2px 8px rgba(45,80,22,0.25)'
            }}>
              <Crown size={14} />
              {user.committeePosition}
            </span>

            {(user.association || user.section) && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.92)',
                borderRadius: '999px',
                padding: '0.25rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                <Users size={13} />
                {[user.association, user.section].filter(Boolean).join(' • ')}
              </span>
            )}
          </div>
        ) : (
          <p className="profile-role">
            {user.role === 'parishioner' ? 'Parishioner' : user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </p>
        )}
        
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
        {avatarMessage && (
          <div className={`${avatarMessage.type === 'success' ? 'success-message' : 'error-message'}`}>
            {avatarMessage.text}
          </div>
        )}
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
                  value={toDateInput(formData.dateOfBirth)}
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
              <label className="form-label" htmlFor="address">
                <MapPin size={16} />
                Address
              </label>
              <textarea
                id="address"
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
                <label className="form-label" htmlFor="emergencyContact">Contact Name</label>
                <input
                  id="emergencyContact"
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="emergencyPhone">Contact Phone</label>
                <input
                  id="emergencyPhone"
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

        {activeTab === 'parish' && (
          <div className="tab-content">
            <h3>Parish Membership</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="association">
                  <Users size={16} />
                  Association (Optional)
                </label>
                <select
                  id="association"
                  name="association"
                  value={formData.association}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                >
                  <option value="">Select association (optional)</option>
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
              
              <div className="form-group">
                <label className="form-label" htmlFor="section">
                  <Church size={16} />
                  Section (Optional)
                </label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Award size={16} />
                  Committee Position
                </label>
                <select
                  name="committeePosition"
                  value={formData.committeePosition}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                >
                  <option value="">Member / Parishioner</option>
                  <option value="Chairperson">Chairperson</option>
                  <option value="Vice Chairperson">Vice Chairperson</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Vice Secretary">Vice Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Organizing Secretary">Organizing Secretary</option>
                  <option value="Committee Member">Committee Member</option>
                  <option value="Advisor">Advisor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <UserCheck size={16} />
                  System Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!isEditing || user.role !== 'admin'}
                  className="form-input"
                  title={user?.role !== 'admin' ? "Only administrators can manually change system roles" : ""}
                >
                  <option value="parishioner">Parishioner</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="secretary">Secretary</option>
                  <option value="reporter">Reporter</option>
                  {user?.role === 'admin' && <option value="admin">Administrator</option>}
                </select>
                <small style={{ color: '#6c757d', display: 'block', marginTop: '4px' }}>
                  {user?.role === 'admin' 
                    ? "System role determines dashboard access levels." 
                    : "System role is automatically managed based on your position."}
                </small>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sacraments' && (
          <div className="tab-content">
            <h3>Sacramental Life</h3>
            
            {/* Baptism */}
            <div className="sacrament-section">
              <h4>Baptism</h4>
              {renderBooleanField('isBaptized', 'Are you baptized?', formData.isBaptized, true)}
              
              {formData.isBaptized === true && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="baptismDate">Baptism Date</label>
                    <input
                      id="baptismDate"
                      type="date"
                      name="baptismDate"
                      value={toDateInput(formData.baptismDate)}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="baptismVenue">Baptism Venue</label>
                    <input
                      id="baptismVenue"
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
                    <label className="form-label" htmlFor="confirmationDate">Confirmation Date</label>
                  <input
                    id="confirmationDate"
                    type="date"
                    name="confirmationDate"
                    value={toDateInput(formData.confirmationDate)}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmationVenue">Confirmation Venue</label>
                    <input
                      id="confirmationVenue"
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
                  <label className="form-label" htmlFor="firstCommunionDate">First Communion Date</label>
                  <input
                    id="firstCommunionDate"
                    type="date"
                    name="firstCommunionDate"
                    value={toDateInput(formData.firstCommunionDate)}
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
                    <label className="form-label" htmlFor="spouseName">Spouse Name</label>
                    <input
                      id="spouseName"
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Full name of spouse"
                    />
                  </div>
                  <div className="form-group">
                      <label className="form-label" htmlFor="marriageDate">Marriage Date</label>
                      <input
                        id="marriageDate"
                        type="date"
                        name="marriageDate"
                        value={toDateInput(formData.marriageDate)}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                  </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="marriageVenue">Marriage Venue</label>
                    <input
                      id="marriageVenue"
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
              <label className="form-label" htmlFor="ordinationDate">
                <Calendar size={16} />
                Ordination Date <span className="required">*</span>
              </label>
              <input
                id="ordinationDate"
                type="date"
                name="ordinationDate"
                value={toDateInput(formData.ordinationDate)}
                onChange={handleInputChange}
                disabled={!isEditing}
                required={user.role === 'priest'}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ordinationVenue">
                <Church size={16} />
                Ordination Venue <span className="required">*</span>
              </label>
              <input
                id="ordinationVenue"
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
              <label className="form-label" htmlFor="ordainedBy">
                <Crown size={16} />
                Ordained By <span className="required">*</span>
              </label>
              <input
                id="ordainedBy"
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
