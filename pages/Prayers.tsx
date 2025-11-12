import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Cross, Crown, Star, Sun, Moon, Clock, Image, Church, BookOpen, Calendar } from 'lucide-react';
import './Prayers.css';

const Prayers: React.FC = () => {
  const { t } = useLanguage();
  
  // Get current date for liturgical readings
  const getCurrentDate = () => {
    const today = new Date();
    return {
      date: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      liturgicalSeason: getLiturgicalSeason(today),
      liturgicalColor: getLiturgicalColor(today)
    };
  };
  
  const getLiturgicalSeason = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Simplified liturgical calendar
    if ((month === 12 && day >= 1) || (month === 1 && day <= 6)) return 'Advent/Christmas';
    if (month >= 2 && month <= 4) return 'Lent/Easter';
    if (month >= 5 && month <= 11) return 'Ordinary Time';
    return 'Ordinary Time';
  };
  
  const getLiturgicalColor = (date: Date) => {
    const season = getLiturgicalSeason(date);
    switch (season) {
      case 'Advent/Christmas': return 'Purple/White';
      case 'Lent/Easter': return 'Purple/White';
      default: return 'Green';
    }
  };
  
  const currentLiturgy = getCurrentDate();
  
  // Sample daily readings - in real implementation, this would come from a liturgical API
  const todaysReadings = {
    firstReading: {
      reference: 'Isaiah 55:10-11',
      text: 'Thus says the LORD: Just as from the heavens the rain and snow come down and do not return there till they have watered the earth, making it fertile and fruitful, giving seed to the one who sows and bread to the one who eats, so shall my word be that goes forth from my mouth; my word shall not return to me void, but shall do my will, achieving the end for which I sent it.'
    },
    psalm: {
      reference: 'Psalm 65:10, 11, 12-13, 14',
      response: 'The seed that falls on good ground will yield a fruitful harvest.',
      text: 'You have visited the land and watered it; greatly have you enriched it. God\'s watercourses are filled; you have prepared the grain.'
    },
    gospel: {
      reference: 'Matthew 13:1-23',
      text: 'On that day, Jesus went out of the house and sat down by the sea. Such large crowds gathered around him that he got into a boat and sat down, and the whole crowd stood along the shore. And he spoke to them at length in parables, saying: "A sower went out to sow..."'
    }
  };

  const prayers = [
    {
      id: 1,
      title: 'Our Father',
      icon: <Cross size={24} />,
      text: `Our Father, who art in heaven,
hallowed be thy name.
Thy kingdom come,
thy will be done,
on earth as it is in heaven.
Give us this day our daily bread,
and forgive us our trespasses,
as we forgive those who trespass against us.
And lead us not into temptation,
but deliver us from evil.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Traditional'
    },
    {
      id: 2,
      title: 'Hail Mary',
      icon: <Crown size={24} />,
      text: `Hail Mary, full of grace,
the Lord is with thee.
Blessed art thou amongst women,
and blessed is the fruit of thy womb, Jesus.
Holy Mary, Mother of God,
pray for us sinners,
now and at the hour of our death.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Marian'
    },
    {
      id: 3,
      title: 'Glory Be',
      icon: <Star size={24} />,
      text: `Glory be to the Father,
and to the Son,
and to the Holy Spirit.
As it was in the beginning,
is now, and ever shall be,
world without end.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Traditional'
    },
    {
      id: 4,
      title: 'Prayer to St. Patrick',
      icon: <Heart size={24} />,
      text: `Saint Patrick, patron of Ireland and our parish,
you brought the light of Christ to a pagan land.
Help us to be missionaries in our own time,
sharing the Gospel through our words and actions.
Intercede for us that we may grow in faith,
hope, and charity.
May your example inspire us to serve God
with courage and dedication.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Saints'
    },
    {
      id: 5,
      title: 'Morning Prayer',
      icon: <Sun size={24} />,
      text: `O God, our Creator and Father,
as we begin this new day,
we offer you our hearts and minds.
Guide our steps and bless our work.
Help us to see you in all we meet
and to serve you in all we do.
May this day bring glory to your name
and peace to our souls.
Through Christ our Lord.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Daily'
    },
    {
      id: 6,
      title: 'Evening Prayer',
      icon: <Moon size={24} />,
      text: `Loving God, as this day comes to an end,
we thank you for your countless blessings.
Forgive us for any wrongs we have done
and help us to forgive others.
Watch over our families and loved ones
as we rest in your peace.
May your angels guard us through the night
and bring us safely to tomorrow's light.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Daily'
    },
    {
      id: 7,
      title: 'Prayer for Our Parish',
      icon: <Church size={24} />,
      text: `Heavenly Father,
bless our parish community of St. Patrick's.
Unite us in love and service to you.
Guide our priests, deacons, and lay ministers.
Help us to welcome all who seek you
and to be instruments of your peace.
May our parish be a beacon of hope
in Makokoba and beyond.
Through Christ our Lord.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Parish'
    },
    {
      id: 8,
      title: 'Prayer Before Meals',
      icon: <Heart size={24} />,
      text: `Bless us, O Lord,
and these thy gifts,
which we are about to receive
from thy bounty,
through Christ our Lord.
Amen.`,
      image: '/api/placeholder/300/200',
      category: 'Daily'
    }
  ];

  const prayerSchedule = [
    { time: '6:00 AM', prayer: 'Morning Prayer & Lauds', days: 'Daily' },
    { time: '12:00 PM', prayer: 'Angelus', days: 'Daily' },
    { time: '3:00 PM', prayer: 'Divine Mercy Chaplet', days: 'Daily' },
    { time: '6:00 PM', prayer: 'Evening Prayer & Vespers', days: 'Daily' },
    { time: '7:00 PM', prayer: 'Rosary', days: 'Monday - Saturday' },
    { time: '8:00 PM', prayer: 'Night Prayer (Compline)', days: 'Daily' }
  ];

  const categories = ['All', 'Traditional', 'Marian', 'Saints', 'Daily', 'Parish'];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredPrayers = activeCategory === 'All' 
    ? prayers 
    : prayers.filter(prayer => prayer.category === activeCategory);

  return (
    <div className="prayers section-padding">
      <div className="container">
        <div className="prayers-header">
          <h1 className="text-center mb-4">{t('prayers.title')}</h1>
          <p className="text-center mb-5">
            {t('prayers.subtitle')}
          </p>
        </div>

        {/* Daily Readings Section */}
        <section className="daily-readings card">
          <div className="readings-header">
            <Calendar className="readings-icon" />
            <div className="readings-info">
              <h2>{t('prayers.daily_readings')}</h2>
              <p className="liturgy-date">{currentLiturgy.date}</p>
              <div className="liturgy-details">
                <span className="liturgy-season">{currentLiturgy.liturgicalSeason}</span>
                <span className="liturgy-color">{t('prayers.liturgical_color')}: {currentLiturgy.liturgicalColor}</span>
              </div>
            </div>
          </div>

          <div className="readings-content">
            <div className="reading-section">
              <h3>{t('prayers.first_reading')}</h3>
              <p className="reading-reference">{todaysReadings.firstReading.reference}</p>
              <div className="reading-text">{todaysReadings.firstReading.text}</div>
            </div>

            <div className="reading-section">
              <h3>{t('prayers.psalm')}</h3>
              <p className="reading-reference">{todaysReadings.psalm.reference}</p>
              <p className="psalm-response"><strong>{t('prayers.response')}:</strong> {todaysReadings.psalm.response}</p>
              <div className="reading-text">{todaysReadings.psalm.text}</div>
            </div>

            <div className="reading-section">
              <h3>{t('prayers.gospel')}</h3>
              <p className="reading-reference">{todaysReadings.gospel.reference}</p>
              <div className="reading-text">{todaysReadings.gospel.text}</div>
            </div>

            <div className="readings-footer">
              <p><strong>{t('prayers.reflection')}:</strong> Today's readings invite us to reflect on how God's Word takes root in our hearts and bears fruit in our daily lives.</p>
            </div>
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
        <div className="prayer-grid">
          {filteredPrayers.map((prayer) => (
            <div key={prayer.id} className="prayer-card card">
              <div className="prayer-image-container">
                <img 
                  src={prayer.image} 
                  alt={prayer.title}
                  className="prayer-image"
                />
                <div className="prayer-image-overlay">
                  <Image size={32} />
                </div>
              </div>
              
              <div className="prayer-content-wrapper">
                <div className="prayer-header">
                  <div className="prayer-icon">
                    {prayer.icon}
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
          ))}
        </div>

        {/* Prayer Schedule */}
        <div className="prayer-schedule card">
          <div className="prayer-header">
            <Clock className="prayer-icon" />
            <h3>Daily Prayer Schedule</h3>
          </div>
          <p className="schedule-description">
            Join us for communal prayer throughout the day. All are welcome to participate in person or in spirit.
          </p>
          <div className="schedule-grid">
            {prayerSchedule.map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">
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
              <strong>Note:</strong> Prayer times may vary during special liturgical seasons. 
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
