import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';

/**
 * Component that tracks page visits automatically on route changes
 */
const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Generate or get a simple session ID from localStorage
        let sessionId = localStorage.getItem('analytics_session_id');
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('analytics_session_id', sessionId);
        }

        await api.analytics.track({
          page_path: location.pathname + location.search,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          session_id: sessionId
        });
      } catch (err) {
        // Silently fail analytics - don't disrupt user experience
        console.error('Analytics tracking failed:', err);
      }
    };

    trackVisit();
  }, [location.pathname, location.search]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
