import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { Clock, MapPin, Phone, Heart, Users, BookOpen, Calendar, Star, Cross, Globe } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { 
    getActiveTheme, 
    saintOfDay, 
    liturgicalInfo, 
    getSectionImages,
    getPublishedImages,
    getLatestPriestMessage,
    liveStreams
  } = useAdmin();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  // Get data from admin context
  const activeTheme = getActiveTheme();
  const massTimeImages = getSectionImages('mass_times');
  const confessionTimeImages = getSectionImages('confession_times');
  const catechismTimeImages = getSectionImages('catechism_times');
  const parishGalleryImages = getPublishedImages().slice(0, 6); // Show only first 6
  const latestPriestMessage = getLatestPriestMessage();

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className="home page-container">
      {/* Hero Section */}
      <section className="hero">
        {/* Background Image Slider */}
        <div className="hero-slider">
          <div className={`slide slide-1 ${currentSlide === 0 ? 'active' : ''}`}>
            <img src="/images/PIC1.png" alt="St. Patrick's Church exterior view" />
          </div>
          <div className={`slide slide-2 ${currentSlide === 1 ? 'active' : ''}`}>
            <img src="/images/PIC2.png" alt="Sunday Mass celebration" />
          </div>
          <div className={`slide slide-3 ${currentSlide === 2 ? 'active' : ''}`}>
            <img src="/images/PIC3.png" alt="Parish community gathering" />
          </div>
        </div>
        
        <div className="hero-overlay">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title fade-in">
                {t('home.welcome')}
              </h1>
              <p className="hero-subtitle fade-in">
                {t('home.subtitle')}
              </p>
              <div className="hero-actions fade-in">
                <Link to="/contact" className="btn btn-primary">
                  {t('home.visit_us')}
                </Link>
                <Link to="/calendar" className="btn btn-secondary">
                  Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slider Indicators */}
        <div className="slider-indicators">
          {[0, 1, 2].map((index) => (
            <span 
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Live Stream Alert Section */}
      {liveStreams && liveStreams.some((s: any) => s.isLive) && (
        <section className="live-alert-section">
          <div className="container">
            <div className="live-alert-content">
              <div className="live-pulse"></div>
              <div className="live-text">
                <h3>{t('live.happening_now')}</h3>
                <p>{liveStreams.find((s: any) => s.isLive)?.title}</p>
              </div>
              <Link to="/watch-mass" className="btn btn-primary btn-small">
                Watch Live Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Physical Spacer to prevent overlap */}
      <div className="home-content-spacer" style={{ height: '100px', width: '100%', background: '#f8f9fa' }}></div>

      {/* Spiritual Content Section */}
      <section className="spiritual-content section-padding" style={{ position: 'relative', zIndex: 10, background: '#f8f9fa' }}>
        <div className="container">
          <div className="grid grid-3">
            {/* Theme of the Year */}
            <div className="card spiritual-card theme-card">
              <div className="spiritual-header">
                <Calendar className="spiritual-icon" />
                <h3>Theme of the Year {activeTheme?.year || new Date().getFullYear()}</h3>
              </div>
              {activeTheme && (
                <div className="theme-content">
                  <div className="theme-image">
                    <img src={activeTheme.imageUrl} alt={activeTheme.title} />
                  </div>
                  <h4>"{activeTheme.title}"</h4>
                  <p className="theme-verse">{activeTheme.verse}</p>
                  <p>{activeTheme.description}</p>
                </div>
              )}
            </div>

            {/* Daily Reading */}
            <div className="card spiritual-card reading-card" style={{ borderLeftColor: liturgicalInfo?.color || 'green' }}>
              <div className="spiritual-header">
                <BookOpen className="spiritual-icon" />
                <h3>Today's Readings</h3>
              </div>
              <div className="reading-content">
                <div className="reading-date">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                {liturgicalInfo && (
                  <>
                    <div className="liturgical-season">
                      <span className="season-badge" style={{ backgroundColor: liturgicalInfo.color }}>
                        {liturgicalInfo.season}
                      </span>
                    </div>
                    <div className="reading-citation">
                      <strong>First Reading:</strong> {liturgicalInfo.readings.firstReading}<br/>
                      <strong>Psalm:</strong> {liturgicalInfo.readings.psalm}<br/>
                      {liturgicalInfo.readings.secondReading && (
                        <><strong>Second Reading:</strong> {liturgicalInfo.readings.secondReading}<br/></>
                      )}
                      <strong>Gospel:</strong> {liturgicalInfo.readings.gospel}
                    </div>
                  </>
                )}
                <div className="reading-preview">
                  <p><strong>Gospel Preview:</strong> "A sower went out to sow. Some seed fell on the path, some on rocky ground, some among thorns, and some on rich soil..."</p>
                </div>
                <div className="reading-reflection">
                  <p><em>"The word of God will not return empty, but will accomplish what I please and succeed in what I sent it to do."</em></p>
                </div>
                <Link to="/prayers" className="btn btn-secondary btn-small reading-link">Read Full Liturgy</Link>
              </div>
            </div>

            {/* Saint of the Day */}
            <div className="card spiritual-card saint-card">
              <div className="spiritual-header">
                <Star className="spiritual-icon" />
                <h3>Saint of the Day</h3>
              </div>
              {saintOfDay ? (
                <div className="saint-content">
                  <div className="saint-image">
                    <img src={saintOfDay.imageUrl} alt={saintOfDay.name} style={{ objectFit: 'contain', backgroundColor: '#f4f4f4' }} />
                  </div>
                  <div className="saint-name">{saintOfDay.name}</div>
                  <div className="saint-title">{saintOfDay.title}</div>
                  <div className="saint-dates">{saintOfDay.dates}</div>
                  <p className="saint-description">
                    {saintOfDay.description}
                  </p>
                  {saintOfDay.quote && (
                    <div className="saint-quote">
                      <em>"{saintOfDay.quote}"</em>
                    </div>
                  )}
                  <div className="saint-prayer">
                    <strong>Prayer:</strong> {saintOfDay.prayer}
                  </div>
                </div>
              ) : (
                <div className="saint-content">
                  <p>Loading saint of the day...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* From Priest's Desk Section - Only show if there is a message */}
      {latestPriestMessage && (
        <section className="priests-desk section-padding">
          <div className="container">
            <div className="priests-desk-content">
              <div className="priests-desk-header">
                <div className="priest-avatar">
                  {latestPriestMessage.authorImageUrl ? (
                    <img src={latestPriestMessage.authorImageUrl} alt={`Fr. ${latestPriestMessage.authorFirstName} ${latestPriestMessage.authorLastName}`} />
                  ) : (
                    <div 
                      className="priest-avatar-fallback"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #2d5016, #1e3510)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {latestPriestMessage.authorFirstName ? latestPriestMessage.authorFirstName[0].toUpperCase() : 'F'}
                      {latestPriestMessage.authorLastName ? latestPriestMessage.authorLastName[0].toUpperCase() : 'R'}
                    </div>
                  )}
                </div>
                <div className="priest-info">
                  <h2>From the Priest's Desk</h2>
                  <p className="priest-name">
                    {latestPriestMessage.authorFirstName 
                      ? `Fr. ${latestPriestMessage.authorFirstName} ${latestPriestMessage.authorLastName}` 
                      : 'Fr. Rodney Simainza'}
                  </p>
                  <p className="priest-title">Parish Priest</p>
                </div>
              </div>
              
              <div className="priests-message card">
                <div className="message-content">
                  <h3>{latestPriestMessage.title}</h3>
                  <p className="message-date">{new Date(latestPriestMessage.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>

                  {(latestPriestMessage.imageUrl || (latestPriestMessage as any).image_url) && (
                    <div
                      className="priest-msg-image-container"
                      style={{
                        width: '100%',
                        height: '350px',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        background: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Blurred background backup layer */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          left: '-10px',
                          right: '-10px',
                          bottom: '-10px',
                          backgroundImage: `url(${latestPriestMessage.imageUrl || (latestPriestMessage as any).image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(12px) brightness(0.6)',
                          opacity: 0.65,
                          zIndex: 1,
                        }}
                      />
                      {/* Contained sharp image foreground layer */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${latestPriestMessage.imageUrl || (latestPriestMessage as any).image_url})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          zIndex: 2,
                        }}
                      />
                    </div>
                  )}

                  <div className="message-text">
                    <div dangerouslySetInnerHTML={{ __html: latestPriestMessage.content }} />
                    <p className="message-signature">
                      In Christ,<br/>
                      <strong>{latestPriestMessage.authorFirstName 
                        ? `Fr. ${latestPriestMessage.authorFirstName} ${latestPriestMessage.authorLastName}` 
                        : 'Fr. Rodney Simainza'}</strong><br/>
                      Parish Priest
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Info Section - Mass Times & Contact */}
      <section className="quick-info section-padding">
        <div className="container">
          <div className="grid grid-3">
            {/* Mass Times Card */}
            <div className="card priority-card">
              {massTimeImages.length > 0 && (
                <div className="card-image">
                  <img src={massTimeImages[0].imageUrl} alt={massTimeImages[0].title} />
                </div>
              )}
              <div className="card-header">
                <Clock className="card-icon" />
                <h3>{t('home.mass_times')}</h3>
              </div>
              <div className="schedule">
                <div className="schedule-item">
                  <strong>{t('home.daily_mass')}</strong>
                  <span>{t('mass.weekdays')}</span>
                </div>
                <div className="schedule-item">
                  <strong>{t('home.saturday_evening')}</strong>
                  <span>{t('mass.saturday')}</span>
                </div>
                <div className="schedule-item highlight">
                  <strong>{t('home.sunday_mass')}</strong>
                  <div>
                    <div>{t('mass.sunday_early')}</div>
                    <div>{t('mass.sunday_main')}</div>
                    <div>{t('mass.sunday_evening')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confession Times Card */}
            <div className="card priority-card">
              {confessionTimeImages.length > 0 && (
                <div className="card-image">
                  <img src={confessionTimeImages[0].imageUrl} alt={confessionTimeImages[0].title} />
                </div>
              )}
              <div className="card-header">
                <Heart className="card-icon" />
                <h3>{t('home.confession_times')}</h3>
              </div>
              <div className="schedule">
                <div className="schedule-item">
                  <span>{t('confession.saturday')}</span>
                </div>
                <div className="schedule-item">
                  <span>{t('confession.sunday')}</span>
                </div>
                <div className="schedule-item">
                  <span>{t('confession.appointment')}</span>
                </div>
              </div>
              <Link to="/contact" className="btn btn-secondary btn-small">
                {t('home.contact_us')}
              </Link>
            </div>

            {/* Catechism Lessons Card */}
            <div className="card priority-card">
              {catechismTimeImages.length > 0 && (
                <div className="card-image">
                  <img src={catechismTimeImages[0].imageUrl} alt={catechismTimeImages[0].title} />
                </div>
              )}
              <div className="card-header">
                <BookOpen className="card-icon" />
                <h3>Catechism Lessons</h3>
              </div>
              <div className="schedule">
                <div className="schedule-item">
                  <strong>Children</strong>
                  <span>Saturday: 08:30 - 10:00</span>
                </div>
                <div className="schedule-item">
                  <strong>Adults</strong>
                  <span>Sunday: 10:00 - 12:00</span>
                </div>
                <div className="schedule-item">
                  <span>Registration at Parish Office</span>
                </div>
              </div>
              <Link to="/contact" className="btn btn-secondary btn-small">
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="contact-quick bg-light section-padding">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-item">
              <MapPin className="contact-icon" />
              <div>
                <h4>{t('contact.address')}</h4>
                <p>{t('contact.parish_address')}</p>
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
          </div>
        </div>
      </section>

      {/* Community Gallery Preview */}
      {parishGalleryImages.length > 0 && (
        <section className="gallery-preview bg-light section-padding">
          <div className="container">
            <h2 className="text-center mb-4">Parish Life Gallery</h2>
            <div className="gallery-grid">
              {parishGalleryImages.map((image) => (
                <div key={image.id} className="gallery-item">
                  <img src={image.url} alt={image.title} />
                  <div className="gallery-overlay">
                    <span>{image.title}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link to="/gallery" className="btn btn-primary">
                View Full Pictures
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Parish History Section */}
      <section className="parish-history section-padding">
        <div className="container">
          <h2 className="section-title text-center">History of St. Patrick's Parish, Bulawayo</h2>
          
          <div className="history-content">
            <div className="history-timeline">
              <div className="timeline-item">
                <div className="timeline-year">1965</div>
                <div className="timeline-image">
                  <img src="/images/PIC1.png" alt="St. Patrick's Church foundation in 1965" />
                </div>
                <div className="timeline-content">
                  <h4>Foundation</h4>
                  <p>St. Patrick's Catholic Church was established in Makokoba, Bulawayo, to serve the growing Catholic community in the area. The parish was founded during a time of significant social and political change in Zimbabwe.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">1970s</div>
                <div className="timeline-image">
                  <img src="/images/PIC2.png" alt="Parish community in the 1970s" />
                </div>
                <div className="timeline-content">
                  <h4>Community Growth</h4>
                  <p>The parish experienced rapid growth as more families moved to Makokoba. The church became a center for both spiritual life and community support, offering services in both English and IsiNdebele.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">1980s</div>
                <div className="timeline-image">
                  <img src="/images/PIC3.png" alt="Independence era celebrations" />
                </div>
                <div className="timeline-content">
                  <h4>Independence Era</h4>
                  <p>Following Zimbabwe's independence, St. Patrick's played a crucial role in community healing and reconciliation. The parish expanded its social justice programs and outreach initiatives.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">1990s-2000s</div>
                <div className="timeline-image">
                  <img src="/images/SYNOD IMAGE.png" alt="Ministry expansion activities" />
                </div>
                <div className="timeline-content">
                  <h4>Ministry Expansion</h4>
                  <p>The parish established numerous ministries including youth groups, women's associations, and educational programs. The church became known for its strong commitment to social justice and community development.</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-year">2010s-Present</div>
                <div className="timeline-image">
                  <img src="/images/logo.png" alt="Modern parish activities" />
                </div>
                <div className="timeline-content">
                  <h4>Modern Era</h4>
                  <p>Today, St. Patrick's continues to serve as a beacon of hope in Makokoba, supporting diaspora connections, maintaining strong community ties, and adapting to modern challenges while preserving Catholic traditions.</p>
                </div>
              </div>
            </div>
          </div>
            
          <div className="history-highlights">
              <h3>Parish Highlights</h3>
              <div className="highlights-grid">
                <div className="highlight-item">
                  <Cross className="highlight-icon" />
                  <h4>Spiritual Heritage</h4>
                  <p>Nearly 60 years of continuous Catholic worship and sacramental life in Makokoba.</p>
                </div>
                <div className="highlight-item">
                  <Users className="highlight-icon" />
                  <h4>Community Impact</h4>
                  <p>Thousands of families have been baptized, confirmed, and married at St. Patrick's.</p>
                </div>
                <div className="highlight-item">
                  <Heart className="highlight-icon" />
                  <h4>Social Justice</h4>
                  <p>Decades of advocacy for human rights, education, and community development.</p>
                </div>
                <div className="highlight-item">
                  <Globe className="highlight-icon" />
                  <h4>Global Connections</h4>
                  <p>Strong ties with parishioners in the diaspora across the UK, South Africa, and beyond.</p>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Quick Info Section */}
      <section className="quick-info section-padding">
        <div className="container">
          <h2 className="section-title text-center">{t('about_us')}</h2>
          <div className="grid grid-2">
            <div className="card about-card">
              <div className="about-icon">
              </div>
              <h3>Our History</h3>
              <p>St. Patrick's Catholic Church has been serving the Makokoba community in Bulawayo for over 50 years, providing spiritual guidance and community support to generations of faithful parishioners.</p>
            </div>
            <div className="card about-card">
              <div className="about-icon">
                <Heart size={48} />
              </div>
              <h3>Our Mission</h3>
              <p>To serve God and our community through worship, outreach, and social justice, embracing both English and IsiNdebele speaking parishioners in unity and love.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Diaspora Corner */}
      <section className="diaspora-corner section-padding">
        <div className="container">
          <div className="card diaspora-card">
            <h3>{t('community.diaspora')}</h3>
            <p>{t('community.diaspora_desc')}</p>
            <div className="diaspora-updates">
              <div className="update-item">
                <strong>UK Parishioners:</strong> Christmas greetings from the Makokoba community
              </div>
              <div className="update-item">
                <strong>South Africa:</strong> Prayer intentions from home parish
              </div>
            </div>
            <Link to="/contact" className="btn btn-secondary">
              Stay Connected
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
