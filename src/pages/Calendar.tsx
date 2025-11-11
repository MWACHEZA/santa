import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import './Calendar.css';

const Calendar: React.FC = () => {
  const { t } = useLanguage();
  const { getPublishedEvents, hasPermission, isAuthenticated } = useAdmin();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'upcoming'>('month');

  const publishedEvents = getPublishedEvents();

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return publishedEvents.filter(event => event.date === dateStr);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const upcoming = publishedEvents.filter(event => new Date(event.date) >= today);
    return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      mass: '#2d5016',
      meeting: '#4ecdc4',
      social: '#45b7d1',
      education: '#f093fb',
      outreach: '#f39c12'
    };
    return colors[category as keyof typeof colors] || '#6c757d';
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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDate(day);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-events' : ''}`}>
          <div className="day-number">{day}</div>
          <div className="day-events">
            {events.slice(0, 3).map((event, index) => (
              <div 
                key={event.id} 
                className="event-dot"
                style={{ backgroundColor: getCategoryColor(event.category) }}
                title={`${event.title} - ${event.time}`}
              >
                <span className="event-icon">{getCategoryIcon(event.category)}</span>
              </div>
            ))}
            {events.length > 3 && (
              <div className="more-events">+{events.length - 3}</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-page section-padding">
      <div className="container">
        <div className="calendar-header">
          <h1 className="text-center mb-4">Parish Calendar</h1>
          <p className="text-center mb-4">Stay updated with all parish events, masses, and community activities</p>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            <CalendarIcon size={20} />
            Monthly View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
            onClick={() => setViewMode('upcoming')}
          >
            <Clock size={20} />
            Upcoming Events
          </button>
        </div>

        {viewMode === 'month' ? (
          <div className="calendar-container">
            {/* Calendar Navigation */}
            <div className="calendar-nav">
              <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                <ChevronLeft size={20} />
              </button>
              <h2 className="month-title">{getMonthName(currentDate)}</h2>
              <button className="nav-btn" onClick={() => navigateMonth('next')}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-actions">
              <button className="btn btn-secondary" onClick={goToToday}>
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day headers */}
              <div className="day-header">Sun</div>
              <div className="day-header">Mon</div>
              <div className="day-header">Tue</div>
              <div className="day-header">Wed</div>
              <div className="day-header">Thu</div>
              <div className="day-header">Fri</div>
              <div className="day-header">Sat</div>

              {/* Calendar days */}
              {renderCalendarDays()}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
              <h4>Event Categories</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: getCategoryColor('mass') }}></div>
                  <span>Mass & Liturgy</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: getCategoryColor('meeting') }}></div>
                  <span>Meetings</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: getCategoryColor('social') }}></div>
                  <span>Social Events</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: getCategoryColor('education') }}></div>
                  <span>Education</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ backgroundColor: getCategoryColor('outreach') }}></div>
                  <span>Outreach</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="upcoming-events">
            <h2>Upcoming Events</h2>
            {getUpcomingEvents().length === 0 ? (
              <div className="no-events">
                <CalendarIcon size={48} />
                <h3>No Upcoming Events</h3>
                <p>Check back soon for upcoming parish events and activities.</p>
              </div>
            ) : (
              <div className="events-list">
                {getUpcomingEvents().map((event) => (
                  <div key={event.id} className="event-card card">
                    <div className="event-header">
                      <div className="event-category" style={{ backgroundColor: getCategoryColor(event.category) }}>
                        <span className="category-icon">{getCategoryIcon(event.category)}</span>
                        <span className="category-name">{event.category}</span>
                      </div>
                      <div className="event-date">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p className="event-description">{event.description}</p>
                      
                      <div className="event-details">
                        <div className="event-detail">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="event-detail">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Add Event (for authorized users) */}
        {isAuthenticated && hasPermission('events') && (
          <div className="quick-actions">
            <a href="/admin/events/add" className="btn btn-primary">
              <Plus size={20} />
              Add Event
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
