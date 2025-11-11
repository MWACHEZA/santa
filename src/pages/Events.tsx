import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { Calendar, Clock, MapPin } from 'lucide-react';
import './Events.css';

const Events: React.FC = () => {
  const { t } = useLanguage();
  const { getPublishedEvents } = useAdmin();
  
  const publishedEvents = getPublishedEvents();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mass': return '⛪';
      case 'meeting': return '👥';
      case 'social': return '🎉';
      case 'education': return '📚';
      case 'outreach': return '🤝';
      default: return '📅';
    }
  };

  return (
    <div className="events section-padding">
      <div className="container">
        <h1 className="text-center mb-4">{t('community.events')}</h1>
        
        {publishedEvents.length === 0 ? (
          <div className="no-events">
            <Calendar size={48} />
            <h3>No Upcoming Events</h3>
            <p>Check back soon for upcoming parish events and activities.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {publishedEvents.map((event) => (
              <div key={event.id} className="card event-card">
                <div className="event-date">
                  <Calendar className="event-icon" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="event-category">
                  <span className="category-icon">{getCategoryIcon(event.category)}</span>
                  <span className="category-name">{event.category}</span>
                </div>
                <h3>{event.title}</h3>
                <div className="event-details">
                  <div className="event-detail">
                    <Clock className="event-icon" />
                    <span>{event.time}</span>
                  </div>
                  <div className="event-detail">
                    <MapPin className="event-icon" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p>{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
