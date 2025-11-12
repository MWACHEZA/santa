import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Music, Users, Heart, BookOpen, Church } from 'lucide-react';
import './Ministries.css';

const Ministries: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="ministries section-padding">
      <div className="container">
        <h1 className="text-center mb-4">{t('ministries.title')}</h1>
        
        {/* Youth Ministries */}
        <div className="ministry-section">
          <h2 className="section-title">Youth Ministries</h2>
          <div className="grid grid-3">
            <div className="card ministry-card youth">
              <Users className="ministry-icon" />
              <h3>Catholic Junior Youth Association (CYA)</h3>
              <p>Faith formation and activities for young Catholics aged 14-17 years.</p>
              <p><strong>Meetings:</strong> Saturdays 2:00 PM</p>
              <p><strong>Activities:</strong> Bible study, sports, community service</p>
            </div>
            <div className="card ministry-card youth">
              <Users className="ministry-icon" />
              <h3>Catholic Senior Youth Association</h3>
              <p>Leadership development and spiritual growth for youth aged 18-25 years.</p>
              <p><strong>Meetings:</strong> Sundays 3:00 PM</p>
              <p><strong>Focus:</strong> Leadership, evangelization, social justice</p>
            </div>
            <div className="card ministry-card youth">
              <Users className="ministry-icon" />
              <h3>Catholic Young Adults Association</h3>
              <p>Fellowship and spiritual development for young adults aged 26-35 years.</p>
              <p><strong>Meetings:</strong> First Friday 7:00 PM</p>
              <p><strong>Activities:</strong> Career guidance, marriage preparation, outreach</p>
            </div>
          </div>
        </div>

        {/* Women's Associations */}
        <div className="ministry-section">
          <h2 className="section-title">Women's Associations</h2>
          <div className="grid grid-3">
            <div className="card ministry-card womens">
              <Heart className="ministry-icon" />
              <h3>Women's Forum</h3>
              <p>General women's fellowship focusing on community support and spiritual growth.</p>
              <p><strong>Meetings:</strong> First Sunday after 8:30 AM Mass</p>
            </div>
            <div className="card ministry-card womens">
              <Heart className="ministry-icon" />
              <h3>St. Anne's Association</h3>
              <p>Devotion to St. Anne, patron saint of mothers and grandmothers.</p>
              <p><strong>Meetings:</strong> Second Sunday of each month</p>
              <p><strong>Feast Day:</strong> July 26th</p>
            </div>
            <div className="card ministry-card womens">
              <Heart className="ministry-icon" />
              <h3>Our Lady of Sodality</h3>
              <p>Marian devotion and service to the Blessed Virgin Mary.</p>
              <p><strong>Meetings:</strong> Third Sunday of each month</p>
              <p><strong>Activities:</strong> Rosary, May devotions, community service</p>
            </div>
            <div className="card ministry-card womens">
              <Heart className="ministry-icon" />
              <h3>Sacred Heart of Jesus</h3>
              <p>Devotion to the Sacred Heart with focus on prayer and adoration.</p>
              <p><strong>Meetings:</strong> First Friday of each month</p>
              <p><strong>Activities:</strong> First Friday devotions, Eucharistic adoration</p>
            </div>
            <div className="card ministry-card womens">
              <Heart className="ministry-icon" />
              <h3>Catholic Women's League (CWL)</h3>
              <p>National organization promoting Catholic values and social justice.</p>
              <p><strong>Meetings:</strong> Last Sunday of each month</p>
              <p><strong>Focus:</strong> Education, health, social justice advocacy</p>
            </div>
          </div>
        </div>

        {/* Children's Ministry */}
        <div className="ministry-section">
          <h2 className="section-title">Children's Ministry</h2>
          <div className="grid grid-2">
            <div className="card ministry-card children">
              <BookOpen className="ministry-icon" />
              <h3>Missionary Childhood Association</h3>
              <p>Teaching children about missions and helping children worldwide.</p>
              <p><strong>Age Group:</strong> 6-12 years</p>
              <p><strong>Meetings:</strong> Sundays after 8:30 AM Mass</p>
              <p><strong>Activities:</strong> Mission education, fundraising for children in need</p>
            </div>
          </div>
        </div>

        {/* Men's Guild */}
        <div className="ministry-section">
          <h2 className="section-title">Men's Guild</h2>
          <div className="grid grid-2">
            <div className="card ministry-card mens">
              <Users className="ministry-icon" />
              <h3>St. Joseph Association</h3>
              <p>Men's fellowship dedicated to St. Joseph, patron of workers and fathers.</p>
              <p><strong>Meetings:</strong> Second Saturday of each month</p>
              <p><strong>Activities:</strong> Spiritual growth, community leadership, parish maintenance</p>
            </div>
          </div>
        </div>

        {/* Prayer Groups */}
        <div className="ministry-section">
          <h2 className="section-title">Prayer Groups</h2>
          <div className="grid grid-3">
            <div className="card ministry-card prayer">
              <Church className="ministry-icon" />
              <h3>Rosary Group</h3>
              <p>Daily recitation of the Holy Rosary for parish intentions.</p>
              <p><strong>Times:</strong> Daily at 7:00 PM</p>
            </div>
            <div className="card ministry-card prayer">
              <Church className="ministry-icon" />
              <h3>Bible Study Group</h3>
              <p>Weekly scripture study and faith sharing sessions.</p>
              <p><strong>Meetings:</strong> Wednesdays at 7:00 PM</p>
            </div>
            <div className="card ministry-card prayer">
              <Church className="ministry-icon" />
              <h3>Focolare Movement</h3>
              <p>International Catholic movement focused on unity and universal brotherhood.</p>
              <p><strong>Meetings:</strong> First Sunday of each month</p>
              <p><strong>Focus:</strong> Living the Gospel, dialogue, unity</p>
            </div>
          </div>
        </div>

        {/* Liturgical Ministry */}
        <div className="ministry-section">
          <h2 className="section-title">Liturgical Ministry</h2>
          <div className="grid grid-3">
            <div className="card ministry-card liturgical">
              <Users className="ministry-icon" />
              <h3>Hospitality (CYA) Ministers</h3>
              <p>Young adults welcoming parishioners and visitors to our parish community.</p>
              <p><strong>Service:</strong> All Sunday Masses</p>
            </div>
            <div className="card ministry-card liturgical">
              <Church className="ministry-icon" />
              <h3>Sacristans</h3>
              <p>Preparing the altar and sacred vessels for liturgical celebrations.</p>
              <p><strong>Training:</strong> Ongoing formation</p>
            </div>
            <div className="card ministry-card liturgical">
              <BookOpen className="ministry-icon" />
              <h3>Eucharistic Ministers</h3>
              <p>Extraordinary ministers of Holy Communion serving at Mass.</p>
              <p><strong>Languages:</strong> English, Shona, and IsiNdebele</p>
            </div>
            <div className="card ministry-card liturgical">
              <Church className="ministry-icon" />
              <h3>Altar Servers</h3>
              <p>Young people assisting the priest during liturgical celebrations.</p>
              <p><strong>Training:</strong> Monthly sessions</p>
            </div>
            <div className="card ministry-card liturgical">
              <Music className="ministry-icon" />
              <h3>Choir</h3>
              <p>Our vibrant choir sings in English, Shona and IsiNdebele, bringing beautiful music to our liturgy.</p>
              <p><strong>Practice:</strong> Saturdays at 2:00 PM</p>
            </div>
          </div>
        </div>

        {/* Committees */}
        <div className="ministry-section">
          <h2 className="section-title">Committees</h2>
          <div className="grid grid-2">
            <div className="card ministry-card committee">
              <Users className="ministry-icon" />
              <h3>Parish Council</h3>
              <p>Advisory body assisting the parish priest in pastoral and administrative matters.</p>
              <p><strong>Meetings:</strong> Monthly</p>
              <p><strong>Members:</strong> Elected representatives from parish groups</p>
            </div>
            <div className="card ministry-card committee">
              <Heart className="ministry-icon" />
              <h3>Parish Development Council</h3>
              <p>Planning and overseeing parish development projects and infrastructure.</p>
              <p><strong>Focus:</strong> Building maintenance, expansion projects, fundraising</p>
            </div>
            <div className="card ministry-card committee">
              <Church className="ministry-icon" />
              <h3>Liturgical Committee</h3>
              <p>Planning and coordinating liturgical celebrations and special events.</p>
              <p><strong>Responsibilities:</strong> Liturgical seasons, special Masses, decorations</p>
            </div>
            <div className="card ministry-card committee">
              <BookOpen className="ministry-icon" />
              <h3>Catechists</h3>
              <p>Teaching and formation team for children and adult catechesis programs.</p>
              <p><strong>Programs:</strong> First Communion, Confirmation, RCIA, Children's catechism</p>
              <p><strong>Training:</strong> Diocesan certification required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ministries;
