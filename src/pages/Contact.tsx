import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Contact.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [reporterForm, setReporterForm] = useState({
    name: '',
    surname: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // St. Patrick's Church coordinates (exact location in Makokoba, Bulawayo)
  const churchPosition: [number, number] = [-20.14596659496229, 28.574752556063075];

  const handleReporterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your interest in becoming a church reporter! We will contact you soon.');
      setReporterForm({ name: '', surname: '', email: '', message: '' });
      setIsSubmitting(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReporterForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="contact section-padding">
      <div className="container">
        <h1 className="text-center mb-4">{t('nav.contact')}</h1>
        
        {/* Contact Information */}
        <div className="grid grid-2">
          <div className="card">
            <h3>Parish Information</h3>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <div>
                  <h4>{t('contact.address')}</h4>
                  <p>St. Patrick's Catholic Church<br/>
                     Makokoba Township<br/>
                     Bulawayo, Zimbabwe</p>
                </div>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" />
                <div>
                  <h4>{t('contact.phone')}</h4>
                  <p>+263 9 123456</p>
                  <p>+263 77 123 4567</p>
                </div>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <div>
                  <h4>{t('contact.email')}</h4>
                  <p>info@stpatricksmakokoba.org</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3>Office Hours</h3>
            <div className="office-hours">
              <div className="hours-item">
                <Clock className="hours-icon" />
                <div>
                  <p><strong>Monday - Friday:</strong> 8:00 AM - 4:00 PM</p>
                  <p><strong>Saturday:</strong> 8:00 AM - 12:00 PM</p>
                  <p><strong>Sunday:</strong> After Masses</p>
                </div>
              </div>
            </div>
            <h4>Parish Staff</h4>
            <div className="staff-list">
              <p><strong>Parish Priest:</strong> Fr.Rodeney Simainza</p>
              <p><strong>Assistant Priest:</strong> santana</p>
              <p><strong>Parish Secretary:</strong> Mr Mzingaye Zulu</p>
            </div>
          </div>
        </div>

        {/* Church Location Map */}
        <div className="map-section">
          <h2 className="section-title text-center">Find Our Church</h2>
          <div className="map-container">
            <MapContainer 
              center={churchPosition} 
              zoom={15} 
              style={{ height: '400px', width: '100%' }}
              className="church-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={churchPosition}>
                <Popup>
                  <div className="map-popup">
                    <h4>St. Patrick's Catholic Church</h4>
                    <p>Makokoba Township, Bulawayo</p>
                    <p><strong>Mass Times:</strong></p>
                    <p>Sunday: 6:30 AM, 8:30 AM, 5:00 PM</p>
                    <p>Weekdays: 6:00 AM</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="map-info">
            <p className="text-center">
              <strong>Getting Here:</strong> St. Patrick's is located in the heart of Makokoba Township. 
              The church is easily accessible by public transport and has parking available for visitors.
            </p>
          </div>
        </div>

        {/* Become a Reporter Form */}
        <div className="reporter-section">
          <h2 className="section-title text-center">Become a Church Reporter</h2>
          <div className="reporter-content">
            <div className="reporter-info">
              <h3>Join Our Communications Team</h3>
              <p>
                Are you passionate about sharing the good news of our parish community? 
                We're looking for dedicated parishioners to help document and share our church activities, 
                events, and community stories.
              </p>
              <div className="reporter-benefits">
                <h4>What You'll Do:</h4>
                <ul>
                  <li>Cover parish events and activities</li>
                  <li>Interview community members</li>
                  <li>Write articles for our newsletter and website</li>
                  <li>Take photos of church events</li>
                  <li>Help maintain our social media presence</li>
                </ul>
              </div>
            </div>
            
            <div className="reporter-form-container">
              <form className="reporter-form" onSubmit={handleReporterSubmit}>
                <h3>Application Form</h3>
                
                {submitMessage && (
                  <div className="submit-message success">
                    {submitMessage}
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">First Name *</label>
                    <div className="input-with-icon">
                      <User className="input-icon" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={reporterForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="surname">Surname *</label>
                    <div className="input-with-icon">
                      <User className="input-icon" />
                      <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={reporterForm.surname}
                        onChange={handleInputChange}
                        placeholder="Enter your surname"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={reporterForm.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Why do you want to become a church reporter? *</label>
                  <div className="input-with-icon">
                    <MessageSquare className="input-icon" />
                    <textarea
                      id="message"
                      name="message"
                      value={reporterForm.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your interest in church communications, any relevant experience, and how you'd like to contribute..."
                      rows={5}
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
