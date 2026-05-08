import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
<<<<<<< HEAD
import { Heart, Cross, Crown, Star, Sun, Moon, Clock, Image, Church, BookOpen, Calendar, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useAdmin } from '../contexts/AdminContext';
=======
import { Heart, Cross, Crown, Star, Sun, Moon, Clock, Image, Church, Calendar } from 'lucide-react';
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
import './Prayers.css';

const Prayers: React.FC = () => {
  const { t } = useLanguage();
  const { liturgicalInfo } = useAdmin();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prayersRes, categoriesRes] = await Promise.all([
          api.liturgicalPrayers.getAll(),
          api.categories.getByType('prayer')
        ]);

        if (prayersRes.success) {
          setPrayers(prayersRes.data?.prayers || prayersRes.data?.items || prayersRes.data || []);
        }

        if (categoriesRes.success) {
          const cats = categoriesRes.data?.items || categoriesRes.data || [];
          const catNames = cats.map((c: any) => c.name);
          setCategories(['All', ...catNames]);
        }
      } catch (err) {
        console.error('Failed to fetch prayer data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Use liturgical data from context
  const activeReadings = liturgicalInfo?.readings;

  // Build a CSS-usable liturgical color for the card background
  const getLiturgicalBg = () => {
    const c = (liturgicalInfo?.color || '').toLowerCase();
    if (c === '#ffd700' || c === 'white' || c === 'gold') return 'linear-gradient(135deg, #6b5a1e, #b8960c)';
    if (c === '#702963' || c === 'purple') return 'linear-gradient(135deg, #4a1a5e, #702963)';
    if (c === '#d22b2b' || c === 'red') return 'linear-gradient(135deg, #7f0f0f, #d22b2b)';
    if (c === 'rose') return 'linear-gradient(135deg, #8a2252, #c05682)';
    // Default: ordinary time green
    return 'linear-gradient(135deg, var(--primary-green), var(--primary-green-light))';
  };

  const getLiturgicalAccent = () => {
    const c = (liturgicalInfo?.color || '').toLowerCase();
    if (c === '#ffd700' || c === 'white' || c === 'gold') return '#f5d060';
    if (c === '#702963' || c === 'purple') return '#d9a0f0';
    if (c === '#d22b2b' || c === 'red') return '#f08080';
    if (c === 'rose') return '#f0a0c8';
    return 'var(--gold)';
  };

  const currentLiturgy = {
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    liturgicalSeason: liturgicalInfo?.season || 'Ordinary Time',
    subSeason: liturgicalInfo?.subSeason,
    liturgicalColor: liturgicalInfo?.color?.toLowerCase() === '#ffd700' ? 'White / Gold' : 
                     liturgicalInfo?.color?.toLowerCase() === '#702963' ? 'Purple' :
                     liturgicalInfo?.color?.toLowerCase() === '#d22b2b' ? 'Red' :
                     liturgicalInfo?.color || 'Green'
  };

  const prayerSchedule = [
    { time: '6:00 AM', prayer: 'Morning Prayer & Lauds', days: 'Daily' },
    { time: '12:00 PM', prayer: 'Angelus', days: 'Daily' },
    { time: '3:00 PM', prayer: 'Divine Mercy Chaplet', days: 'Daily' },
    { time: '6:00 PM', prayer: 'Evening Prayer & Vespers', days: 'Daily' },
    { time: '7:00 PM', prayer: 'Rosary', days: 'Monday - Saturday' },
    { time: '8:00 PM', prayer: 'Night Prayer (Compline)', days: 'Daily' }
  ];

  const getPrayerIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'traditional': return <Cross size={24} />;
      case 'marian': return <Crown size={24} />;
      case 'saints': return <Star size={24} />;
      case 'daily': return <Sun size={24} />;
      case 'parish': return <Church size={24} />;
      default: return <Heart size={24} />;
    }
  };

  const isPrayerPublished = (prayer: any) => {
    return prayer.isPublished !== false && prayer.is_active !== false && prayer.isActive !== false;
  };

  const filteredPrayers = activeCategory === 'All' 
    ? prayers.filter(p => isPrayerPublished(p))
    : prayers.filter(prayer => (prayer.category || '').toLowerCase() === activeCategory.toLowerCase() && isPrayerPublished(prayer));

  return (
    <div className="prayers section-padding">
      <div className="container">
        <div className="prayers-header">
          <h1 className="text-center mb-4">{t('prayers.title')}</h1>
          <p className="text-center mb-5">
            {t('prayers.subtitle')}
          </p>
        </div>

        {/* Daily Readings Section — dynamically styled with liturgical colour */}
        <section
          className="daily-readings card"
          style={{ background: getLiturgicalBg(), borderLeftColor: getLiturgicalAccent() }}
        >
          <div className="readings-header">
            <Calendar className="readings-icon" size={32} style={{ color: getLiturgicalAccent() }} />
            <div className="readings-info">
              <h2>{liturgicalInfo?.liturgicalNote || liturgicalInfo?.season || t('prayers.daily_readings')}</h2>
              <p className="liturgy-date" style={{ color: getLiturgicalAccent() }}>{currentLiturgy.date}</p>
              <div className="liturgy-details">
                <span className="liturgy-season">{currentLiturgy.liturgicalSeason}</span>
                <span className="liturgy-color">🎨 Liturgical Colour: <strong>{currentLiturgy.liturgicalColor}</strong></span>
              </div>
            </div>
          </div>

          <div className="readings-content">
            {activeReadings ? (
              <>
                <div className="reading-section" style={{ borderLeftColor: getLiturgicalAccent() }}>
                  <h3 style={{ color: getLiturgicalAccent() }}>📖 {t('prayers.first_reading')}</h3>
                  <p className="reading-reference">{activeReadings.firstReading}</p>
                  <p className="reading-subtext">Click "View Full Text on USCCB" below to read the full passage.</p>
                </div>

                <div className="reading-section" style={{ borderLeftColor: getLiturgicalAccent() }}>
                  <h3 style={{ color: getLiturgicalAccent() }}>🎵 {t('prayers.psalm')}</h3>
                  <p className="reading-reference">{activeReadings.psalm}</p>
                </div>

                {activeReadings.secondReading && (
                  <div className="reading-section" style={{ borderLeftColor: getLiturgicalAccent() }}>
                    <h3 style={{ color: getLiturgicalAccent() }}>📖 {t('prayers.second_reading') || 'Second Reading'}</h3>
                    <p className="reading-reference">{activeReadings.secondReading}</p>
                  </div>
                )}

                <div className="reading-section" style={{ borderLeftColor: getLiturgicalAccent() }}>
                  <h3 style={{ color: getLiturgicalAccent() }}>✝️ {t('prayers.gospel')}</h3>
                  <p className="reading-reference">{activeReadings.gospel}</p>
                </div>

                <div className="readings-footer" style={{ borderLeftColor: getLiturgicalAccent() }}>
                  {liturgicalInfo?.liturgicalNote && (
                    <p className="liturgical-note"><strong>📅 Celebration:</strong> {liturgicalInfo.liturgicalNote}</p>
                  )}
                  {liturgicalInfo?.historicalNote && (
                    <p className="historical-note"><strong>📜 History:</strong> {liturgicalInfo.historicalNote}</p>
                  )}
                  <p><strong>🙏 {t('prayers.reflection')}:</strong> Today's readings invite us to reflect on how God's Word takes root in our hearts and bears fruit in our daily lives.</p>
                  {liturgicalInfo?.usccbLink && (
                    <a href={liturgicalInfo.usccbLink} target="_blank" rel="noopener noreferrer" className="usccb-btn" style={{ background: getLiturgicalAccent(), color: '#1a1a1a' }}>
                      View Full Text on USCCB <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="readings-loading">
                <p>Loading today's readings...</p>
              </div>
            )}
          </div>
        </section>

        {/* Prayer Categories */}
        <div className="prayer-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Prayer Grid */}
        {filteredPrayers.length === 0 && !isLoading && (
          <div className="no-prayers">
            <Heart size={48} />
            <h3>No Prayers Found</h3>
            <p>No prayers have been published in this category yet.</p>
          </div>
        )}
        <div className="prayer-grid">
          {filteredPrayers.map((prayer) => {
            const imgSrc = prayer.imageUrl || prayer.image_url || null;
            return (
              <div key={prayer.id} className="prayer-card card">
                {/* Only show image block if there's a valid URL */}
                {imgSrc && (
                  <div className="prayer-image-container">
                    <img
                      src={imgSrc}
                      alt={prayer.title}
                      className="prayer-image"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                    />
                    <div className="prayer-image-overlay">
                      <Image size={32} />
                    </div>
                  </div>
                )}

                <div className="prayer-content-wrapper">
                  <div className="prayer-header">
                    <div className="prayer-icon">
                      {getPrayerIcon(prayer.category)}
                    </div>
                    <div>
                      <h3>{prayer.title}</h3>
                      <span className="prayer-category">{prayer.category}</span>
                    </div>
                  </div>

                  <div className="prayer-text">
                    <p>{prayer.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prayer Schedule */}
        <div className="prayer-schedule card" style={{ background: getLiturgicalBg(), borderLeftColor: getLiturgicalAccent() }}>
          <div className="prayer-schedule-header">
            <Clock size={28} style={{ color: getLiturgicalAccent() }} />
            <h3>Daily Prayer Schedule</h3>
          </div>
          <p className="schedule-description">
            Join us for communal prayer throughout the day. All are welcome to participate in person or in spirit.
          </p>
          <div className="schedule-grid">
            {prayerSchedule.map((item, index) => (
              <div key={index} className="schedule-item" style={{ borderLeftColor: getLiturgicalAccent() }}>
                <div className="schedule-time" style={{ color: getLiturgicalAccent() }}>
                  <strong>{item.time}</strong>
                </div>
                <div className="schedule-details">
                  <div className="schedule-prayer">{item.prayer}</div>
                  <div className="schedule-days">{item.days}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="schedule-note">
            <p>
              <strong>📌 Note:</strong> Prayer times may vary during special liturgical seasons.
              Please check the parish bulletin for any changes.
            </p>
          </div>
        </div>

        {/* Prayer Intentions */}
        <div className="prayer-intentions card">
          <h3>Prayer Intentions</h3>
          <p>
            We invite you to submit your prayer intentions. Our parish community will remember 
            your needs in our daily prayers and during Mass.
          </p>
          <div className="intentions-form">
            <textarea 
              placeholder="Share your prayer intention here..."
              rows={4}
              className="intention-input"
            />
            <button className="btn btn-primary">
              <Heart size={20} />
              Submit Intention
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prayers;
