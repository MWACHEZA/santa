import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Heart, Cross, Clock, Star } from 'lucide-react';
import './Prayers.css';

const Prayers: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);

  const prayers = {
    rosary: {
      title: "The Holy Rosary",
      icon: <Heart className="prayer-icon" />,
      content: `
        The Rosary is a form of prayer used in the Catholic Church based on the repetition of the Hail Mary prayer.
        
        How to Pray the Rosary:
        1. Make the Sign of the Cross
        2. Say the Apostles' Creed
        3. Say the Our Father
        4. Say three Hail Marys
        5. Say the Glory Be
        6. Announce the First Mystery and say the Our Father
        7. Say ten Hail Marys while meditating on the Mystery
        8. Say the Glory Be
        9. Say the Fatima Prayer (optional)
        10. Repeat steps 6-9 for the remaining four Mysteries
        11. Say the Hail Holy Queen
        12. Say the Final Prayer
        13. Make the Sign of the Cross
      `
    },
    mysteries: {
      title: "Mysteries of the Rosary",
      icon: <Star className="prayer-icon" />,
      content: `
        Joyful Mysteries (Monday & Saturday):
        1. The Annunciation
        2. The Visitation
        3. The Nativity
        4. The Presentation
        5. The Finding in the Temple
        
        Sorrowful Mysteries (Tuesday & Friday):
        1. The Agony in the Garden
        2. The Scourging at the Pillar
        3. The Crowning with Thorns
        4. The Carrying of the Cross
        5. The Crucifixion
        
        Glorious Mysteries (Wednesday & Sunday):
        1. The Resurrection
        2. The Ascension
        3. The Descent of the Holy Spirit
        4. The Assumption
        5. The Coronation of Mary
        
        Luminous Mysteries (Thursday):
        1. The Baptism of Jesus
        2. The Wedding at Cana
        3. The Proclamation of the Kingdom
        4. The Transfiguration
        5. The Institution of the Eucharist
      `
    },
    chaplet: {
      title: "Chaplet of Divine Mercy",
      icon: <Cross className="prayer-icon" />,
      content: `
        The Chaplet of Divine Mercy is a Christian devotion to the Divine Mercy.
        
        How to Pray the Chaplet:
        1. Make the Sign of the Cross
        2. Say the Opening Prayer (optional)
        3. Say the Our Father, Hail Mary, and Apostles' Creed
        4. On the large beads, say: "Eternal Father, I offer you the Body and Blood, Soul and Divinity of Your Dearly Beloved Son, Our Lord, Jesus Christ, in atonement for our sins and those of the whole world."
        5. On the small beads, say: "For the sake of His sorrowful Passion, have mercy on us and on the whole world."
        6. Repeat steps 4-5 for all five decades
        7. Conclude with: "Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world." (3 times)
        8. Say the Closing Prayer (optional)
      `
    },
    novena: {
      title: "Novena of Divine Mercy",
      icon: <Clock className="prayer-icon" />,
      content: `
        The Divine Mercy Novena is prayed for nine consecutive days, beginning on Good Friday.
        
        Daily Prayer:
        "I wish to be transformed into Your mercy and to be Your living reflection, O Lord. May the greatest of all divine attributes, that of Your unfathomable mercy, pass through my heart and soul to my neighbor."
        
        Each day has specific intentions:
        Day 1: All mankind, especially sinners
        Day 2: The souls of priests and religious
        Day 3: All devout and faithful souls
        Day 4: Those who do not believe in God and those who do not yet know Jesus
        Day 5: The souls of separated brethren
        Day 6: The meek and humble souls and the souls of children
        Day 7: The souls who especially venerate and glorify My mercy
        Day 8: The souls who are detained in purgatory
        Day 9: The souls who have become lukewarm
      `
    },
    stations: {
      title: "Stations of the Cross",
      icon: <BookOpen className="prayer-icon" />,
      content: `
        The Stations of the Cross is a Christian pilgrimage devotion to the Passion of Christ.
        
        The Fourteen Stations:
        1. Jesus is condemned to death
        2. Jesus carries his cross
        3. Jesus falls the first time
        4. Jesus meets his mother
        5. Simon of Cyrene helps Jesus carry the cross
        6. Veronica wipes the face of Jesus
        7. Jesus falls the second time
        8. Jesus meets the women of Jerusalem
        9. Jesus falls the third time
        10. Jesus is stripped of his garments
        11. Jesus is nailed to the cross
        12. Jesus dies on the cross
        13. Jesus is taken down from the cross
        14. Jesus is laid in the tomb
        
        At each station, pray:
        "We adore You, O Christ, and we praise You, because by Your holy cross You have redeemed the world."
      `
    }
  };

  return (
    <div className="prayers section-padding">
      <div className="container">
        <h1 className="text-center mb-4">Prayers & Devotions</h1>
        <p className="text-center mb-4">Deepen your faith through these traditional Catholic prayers and devotions</p>
        
        <div className="prayer-grid">
          {Object.entries(prayers).map(([key, prayer]) => (
            <div key={key} className="prayer-card card" onClick={() => setSelectedPrayer(selectedPrayer === key ? null : key)}>
              <div className="prayer-header">
                {prayer.icon}
                <h3>{prayer.title}</h3>
              </div>
              <div className={`prayer-content ${selectedPrayer === key ? 'expanded' : ''}`}>
                <div className="prayer-text">
                  {prayer.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="prayer-schedule card">
          <h3>Prayer Schedule at St. Patrick's</h3>
          <div className="schedule-grid">
            <div className="schedule-item">
              <strong>Daily Rosary:</strong> 30 minutes before each Mass
            </div>
            <div className="schedule-item">
              <strong>Stations of the Cross:</strong> Fridays during Lent, 6:00 PM
            </div>
            <div className="schedule-item">
              <strong>Divine Mercy Chaplet:</strong> Fridays, 3:00 PM
            </div>
            <div className="schedule-item">
              <strong>Eucharistic Adoration:</strong> First Friday of each month, 7:00 PM - 8:00 PM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prayers;
