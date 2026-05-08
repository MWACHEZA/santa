import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Music, Users, Heart, BookOpen, Church, Image as ImageIcon, Calendar, Phone } from 'lucide-react';
import { api } from '../services/api';
import { type Ministry } from '../contexts/AdminContext';
import './Ministries.css';

const Ministries: React.FC = () => {
  const { t } = useLanguage();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const res = await api.ministries.getAll({ active: true });
        if (res.success) {
          const rawMinistries = res.data?.ministries || res.data?.items || res.data || [];
          const mappedMinistries = rawMinistries.map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            category: m.category || '',
            imageUrl: m.image_url || m.imageUrl || '',
            contactPerson: m.leader_name || m.contactPerson || '',
            meetingTime: m.meeting_schedule || m.meetingTime || '',
            isActive: m.is_active !== undefined ? m.is_active : (m.isActive !== undefined ? m.isActive : true),
            createdAt: m.created_at || m.createdAt
          }));
          setMinistries(mappedMinistries);
        }
      } catch (err) {
        console.error('Failed to fetch ministries', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMinistries();
  }, []);

  const getMinistryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'youth':
      case 'youth ministries': return <Users className="ministry-icon" />;
      case 'women':
      case 'women\'s associations':
      case 'womens': return <Heart className="ministry-icon" />;
      case 'children':
      case 'children\'s ministry': return <BookOpen className="ministry-icon" />;
      case 'men':
      case 'men\'s guild':
      case 'mens': return <Users className="ministry-icon" />;
      case 'prayer':
      case 'prayer groups': return <Church className="ministry-icon" />;
      case 'liturgical':
      case 'liturgical ministry': return <Church className="ministry-icon" />;
      case 'music': return <Music className="ministry-icon" />;
      default: return <Users className="ministry-icon" />;
    }
  };

  if (isLoading) {
    return <div className="loading">Loading ministries...</div>;
  }

  // Group database ministries by category
  const groupedDynamic = ministries.reduce((acc: Record<string, Ministry[]>, item: Ministry) => {
    const cat = item.category || 'Other Ministries';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {});

  const hasDynamicMinistries = ministries.length > 0;

  return (
    <div className="ministries section-padding">
      <div className="container">
        <h1 className="text-center mb-4">{t('ministries.title')}</h1>
        
        {hasDynamicMinistries ? (
          Object.entries(groupedDynamic).map(([category, items]) => (
            <div key={category} className="ministry-section">
              <h2 className="section-title">{category}</h2>
              <div className="grid grid-3">
                {items.map((ministry) => (
                  <div key={ministry.id} className="card ministry-card dynamic">
                    {ministry.imageUrl && (
                      <div className="ministry-img-container">
                        <img 
                          src={ministry.imageUrl} 
                          alt={ministry.name} 
                          className="ministry-card-header-img" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="ministry-card-content">
                      {!ministry.imageUrl && getMinistryIcon(ministry.category)}
                      <h3>{ministry.name}</h3>
                      <p>{ministry.description}</p>
                      
                      {(ministry.meetingTime || ministry.contactPerson) && (
                        <div className="ministry-meta-info">
                          {ministry.meetingTime && (
                            <div className="ministry-meta-item">
                              <Calendar size={16} className="text-muted" />
                              <span><strong>{t('ministries.meetings')}:</strong> {ministry.meetingTime}</span>
                            </div>
                          )}
                          {ministry.contactPerson && (
                            <div className="ministry-meta-item">
                              <Phone size={16} className="text-muted" />
                              <span><strong>{t('ministries.contact')}:</strong> {ministry.contactPerson}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-ministries-container">
            <Users className="no-ministries-icon" size={64} />
            <h3>No Active Ministries</h3>
            <p>There are no registered ministries at the moment. Please check back later or contact the parish administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ministries;
