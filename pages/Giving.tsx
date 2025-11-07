import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, CreditCard, Building, Smartphone } from 'lucide-react';
import './Giving.css';

const Giving: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="giving section-padding">
      <div className="container">
        <div className="giving-header text-center mb-4">
          <h1>{t('giving.title')}</h1>
          <p className="giving-subtitle">{t('giving.subtitle')}</p>
        </div>
        
        <div className="grid grid-2">
          <div className="card giving-card">
            <Heart className="giving-icon" />
            <h3>{t('giving.offertory')}</h3>
            <p>Traditional offering during Mass services. Envelopes handed out during designated mass.</p>
            <div className="giving-details">
              <p><strong>Collection Times:</strong></p>
              <p>• During all Mass services</p>
              <p>• Special collections for parish projects</p>
            </div>
          </div>
          
          <div className="card giving-card">
            <Building className="giving-icon" />
            <h3>{t('giving.bank')}</h3>
            <p>Direct bank transfers for regular giving and special donations.</p>
            <div className="bank-details">
              <p><strong>Bank:</strong> CBZ Bank</p>
              <p><strong>Account Name:</strong> St. Patrick's Catholic Church</p>
              <p><strong>Account Number:</strong> 12345678901</p>
              <p><strong>Branch:</strong> Bulawayo Main</p>
            </div>
          </div>
          
          <div className="card giving-card">
            <Smartphone className="giving-icon" />
            <h3>Mobile Money</h3>
            <p>Convenient mobile money transfers for your donations.</p>
            <div className="mobile-details">
              <p><strong>EcoCash:</strong> 0777 123 456</p>
              <p><strong>OneMoney:</strong> 0711 123 456</p>
              <p><strong>Reference:</strong> Your name + "Donation"</p>
            </div>
          </div>
          
          <div className="card giving-card">
            <CreditCard className="giving-icon" />
            <h3>Special Projects</h3>
            <p>Targeted giving for specific parish needs and community projects.</p>
            <div className="projects-list">
              <p>• Church renovation fund</p>
              <p>• Youth ministry programs</p>
              <p>• Community outreach initiatives</p>
              <p>• Education support fund</p>
            </div>
          </div>
        </div>
        
        <div className="stewardship-message">
          <div className="card stewardship-card">
            <h3>Stewardship Message</h3>
            <p>Your generous contributions directly support our parish community, maintain our beautiful church, and enable us to serve those in need in Makokoba and surrounding areas. Every donation, no matter the size, makes a meaningful difference in our shared mission of faith, hope, and love.</p>
            <blockquote>
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Giving;
