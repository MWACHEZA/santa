import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Phone, Mail, Heart, Facebook, Instagram, Youtube } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo">
                <span className="cross">✝</span>
              </div>
              <div>
                <h3>St. Patrick's</h3>
                <p>Makokoba, Bulawayo</p>
              </div>
            </div>
            <p className="footer-description">
              Serving our community with faith, hope, and love since 1970. 
              A welcoming parish for all English,Shona and IsiNdebele speaking Catholics.
            </p>
          </div>

          <div className="footer-section">
            <h4>{t('footer.quick_links')}</h4>
            <ul className="footer-links">
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/about">{t('nav.about')}</Link></li>
              <li><Link to="/ministries">{t('nav.ministries')}</Link></li>
              <li><Link to="/outreach">{t('nav.outreach')}</Link></li>
              <li><Link to="/sacraments">{t('nav.sacraments')}</Link></li>
              <li><Link to="/events">{t('nav.events')}</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>{t('footer.mass_times_footer')}</h4>
            <div className="mass-times">
              <p><strong>Weekdays:</strong> 6:00 AM</p>
              <p><strong>Saturday:</strong> 6:30 AM</p>
              <p><strong>Sunday:</strong>   8:00 AM</p>
              <p><strong>Confession:</strong> On request and designated times</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>{t('footer.contact_info_footer')}</h4>
            <div className="contact-details">
              <div className="contact-item">
                <MapPin size={16} />
                <span>Makokoba, Bulawayo, Zimbabwe</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+263 9 123456</span>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <span>info@stpatricksmakokoba.org</span>
              </div>
            </div>
            
            <div className="social-media">
              <h5>{t('footer.follow_us')}</h5>
              <div className="social-links">
                <a 
                  href="https://facebook.com/stpatricksmakokoba" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link facebook"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://instagram.com/stpatricksmakokoba" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://youtube.com/@stpatricksmakokoba" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link youtube"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 St. Patrick's Catholic Church, Makokoba. {t('footer.all_rights')}.</p>
            <div className="footer-bottom-links">
              <span>{t('footer.archdiocese')}</span>
              <Heart size={16} className="heart-icon" />
              <Link to="/giving">{t('footer.support_mission')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
