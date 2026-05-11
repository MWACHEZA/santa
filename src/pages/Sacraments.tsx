
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Cross, Heart, Crown, Church, Users, BookOpen, Droplets, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { type Sacrament as SacramentType } from '../contexts/AdminContext';

import './Sacraments.css';

const SACRAMENTS_DATA: SacramentType[] = [
  {
    id: 'baptism',
    name: 'Baptism',
    description: 'The first sacrament of Christian initiation, welcoming the person into the Church.',
    requirements: ['Birth Certificate', 'Godparents Information', 'Parents Baptismal Certificates'],
    preparationTime: '2 weeks preparation',
    imageUrl: '/images/baptism.png'
  },
  {
    id: 'confirmation',
    name: 'Confirmation',
    description: 'A sacrament of initiation that completes the grace of Baptism through the sealing of the Holy Spirit.',
    requirements: ['Baptismal Certificate', 'Sponsor Details', 'Completion of Catechism classes'],
    preparationTime: '1 year program',
    imageUrl: '/images/confirmation.jpg'
  },
  {
    id: 'eucharist',
    name: 'Eucharist',
    description: "Also known as Holy Communion, it is the center of the Church's life.",
    requirements: ['Baptismal Certificate', 'First Reconciliation'],
    preparationTime: '6 months preparation',
    imageUrl: '/images/holy communion.jpg'
  },
  {
    id: 'reconciliation',
    name: 'Reconciliation',
    description: "The sacrament through which we receive God's forgiveness for our sins.",
    requirements: ['Baptism'],
    preparationTime: 'Continuous',
    imageUrl: '/images/confession.jpg'
  },
  {
    id: 'anointing',
    name: 'Anointing of the Sick',
    description: 'A sacrament of healing for those who are seriously ill or elderly.',
    requirements: ['None (Available upon request)'],
    preparationTime: 'Immediate/On-call',
    imageUrl: '/images/annointing of the sick.jpg'
  },
  {
    id: 'marriage',
    name: 'Marriage',
    description: 'The sacrament by which a man and a woman establish a lifelong partnership.',
    requirements: ['Baptismal & Confirmation Certificates', 'Marriage Preparation Course', 'Civil Documents'],
    preparationTime: '6 months preparation',
    imageUrl: '/images/marriage.png'
  },
  {
    id: 'holy-orders',
    name: 'Holy Orders',
    description: 'The sacrament through which the mission entrusted by Christ to his apostles continues.',
    requirements: ['Baptismal Certificate', 'Confirmation Certificate', 'Discernment Interview'],
    preparationTime: 'Years of formation',
    imageUrl: '/images/holy orders.webp'
  }
];

const Sacraments: React.FC = () => {

  const { t } = useLanguage();
  const [activeSacramentId, setActiveSacramentId] = useState<string>(SACRAMENTS_DATA[0].id);


  const getSacramentIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('baptism')) return <Droplets size={32} />;
    if (lowerName.includes('confirmation')) return <Crown size={32} />;
    if (lowerName.includes('eucharist') || lowerName.includes('communion')) return <Church size={32} />;
    if (lowerName.includes('reconciliation') || lowerName.includes('confession')) return <Heart size={32} />;
    if (lowerName.includes('anointing')) return <Cross size={32} />;
    if (lowerName.includes('marriage') || lowerName.includes('matrimony')) return <Heart size={32} />;
    if (lowerName.includes('holy orders') || lowerName.includes('priesthood')) return <BookOpen size={32} />;
    return <Church size={32} />;
  };

  const activeSacrament = SACRAMENTS_DATA.find(s => s.id === activeSacramentId);

  return (
    <div className="sacraments section-padding">
      <div className="container">
        <h1 className="text-center mb-4">{t('sacraments.title')}</h1>
        
        <div className="sacraments-container">
          <div className="sacraments-tabs">
            {SACRAMENTS_DATA.map((sacrament) => (
              <button
                key={sacrament.id}
                className={`sacrament-tab ${activeSacramentId === sacrament.id ? 'active' : ''}`}
                onClick={() => setActiveSacramentId(sacrament.id)}
              >
                <span className="tab-icon">{getSacramentIcon(sacrament.name)}</span>
                <span className="tab-name">{sacrament.name}</span>
              </button>
            ))}
          </div>

          <div className="sacrament-content">
            {activeSacrament && (
              <div className="sacrament-details animate-fade-in" key={activeSacrament.id}>
                <div className="sacrament-hero">
                  <div className="hero-text">
                    <h2>{activeSacrament.name}</h2>
                    <p className="sacrament-description">{activeSacrament.description}</p>
                  </div>
                  <div className="hero-image-container">
                    <img 
                      src={activeSacrament.imageUrl} 
                      alt={activeSacrament.name} 
                      className="hero-image"
                    />
                  </div>
                </div>

                <div className="sacrament-body">
                  <div className="info-section">
                    <h3>Requirements</h3>
                    <ul className="requirements-list">
                      {(activeSacrament.requirements || []).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="info-section">
                    <h3>Preparation Time</h3>
                    <div className="prep-time-card">
                      <p>{activeSacrament.preparationTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sacrament-footer">
          <h3>Need More Information?</h3>
          <p>
            Our priests and parish staff are here to guide you through your spiritual journey. 
            For scheduling or specific questions, please reach out to us.
          </p>
          <div className="footer-contact-grid">
            <div className="footer-contact-item">
              <strong>Parish Office</strong>
              <span>+263 9 123456</span>
            </div>
            <div className="footer-contact-item">
              <strong>Email Address</strong>
              <span>info@stpatricksmakokoba.org</span>
            </div>
            <div className="footer-contact-item">
              <strong>Office Hours</strong>
              <span>Mon-Fri: 8:00 AM - 4:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sacraments;
