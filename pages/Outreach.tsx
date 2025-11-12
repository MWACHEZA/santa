import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Users, BookOpen, Stethoscope, Utensils, GraduationCap } from 'lucide-react';
import './Outreach.css';

const Outreach: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="outreach">
      {/* Hero Section */}
      <section className="outreach-hero">
        <div className="container">
          <div className="hero-content">
            <h1>{t('outreach.title')}</h1>
            <p>Serving our community in Makokoba and Mzilikazi with love, compassion, and practical support</p>
          </div>
        </div>
      </section>

      {/* Main Outreach Programs */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-2">
            {/* Caritas Outreach */}
            <div className="card outreach-card">
              <div className="card-header">
                <Heart className="card-icon" />
                <h3>{t('outreach.caritas')}</h3>
              </div>
              <p className="card-description">
                {t('outreach.caritas_desc')}
              </p>
              <div className="services-list">
                <div className="service-item">
                  <Utensils className="service-icon" />
                  <div>
                    <h4>Food Aid Program</h4>
                    <p>Monthly food parcels for families in need, emergency food assistance, and community soup kitchen</p>
                  </div>
                </div>
                <div className="service-item">
                  <Stethoscope className="service-icon" />
                  <div>
                    <h4>Health Support</h4>
                    <p>Medical assistance fund, health education workshops, and connections to healthcare services</p>
                  </div>
                </div>
                <div className="service-item">
                  <GraduationCap className="service-icon" />
                  <div>
                    <h4>Education Assistance</h4>
                    <p>School fees support, uniforms and books program, and after-school tutoring</p>
                  </div>
                </div>
              </div>
              <div className="contact-info">
                <h4>Contact Caritas Desk:</h4>
                <p>📞 +263 77 123 4567</p>
                <p>📧 caritas@stpatricksmakokoba.org</p>
                <p>🕒 Monday - Friday: 8:00 AM - 4:00 PM</p>
              </div>
            </div>

            {/* HIV/AIDS Ministry */}
            <div className="card outreach-card">
              <div className="card-header">
                <Users className="card-icon" />
                <h3>{t('outreach.hiv_aids')}</h3>
              </div>
              <p className="card-description">
                {t('outreach.hiv_aids_desc')}
              </p>
              <div className="hiv-services">
                <div className="hiv-service">
                  <h4>Support Groups</h4>
                  <p>Weekly support meetings for those living with HIV/AIDS and their families</p>
                  <span className="schedule">Thursdays 2:00 PM - 4:00 PM</span>
                </div>
                <div className="hiv-service">
                  <h4>Counseling Services</h4>
                  <p>Individual and family counseling with trained pastoral counselors</p>
                  <span className="schedule">By appointment</span>
                </div>
                <div className="hiv-service">
                  <h4>Medication Support</h4>
                  <p>Assistance with accessing ARV treatment and adherence support</p>
                </div>
                <div className="hiv-service">
                  <h4>Prevention Education</h4>
                  <p>Community workshops on HIV prevention and awareness</p>
                  <span className="schedule">Monthly community sessions</span>
                </div>
              </div>
              <div className="contact-info">
                <h4>HIV/AIDS Ministry Contact:</h4>
                <p>📞 +263 77 987 6543</p>
                <p>📧 hivaids@stpatricksmakokoba.org</p>
                <p><em>All services are confidential</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Support Section */}
      <section className="education-section bg-light section-padding">
        <div className="container">
          <h2 className="text-center mb-4">{t('outreach.education')}</h2>
          <div className="grid grid-3">
            <div className="card education-card">
              <BookOpen className="education-icon" />
              <h4>Tutoring Programs</h4>
              <p>Free after-school tutoring for primary and secondary students in Mathematics, English, and Science</p>
              <div className="program-details">
                <p><strong>When:</strong> Monday - Friday, 3:30 PM - 5:30 PM</p>
                <p><strong>Where:</strong> Parish Hall</p>
                <p><strong>Ages:</strong> 8-18 years</p>
              </div>
            </div>
            <div className="card education-card">
              <GraduationCap className="education-icon" />
              <h4>Scholarship Program</h4>
              <p>Financial assistance for deserving students to continue their education</p>
              <div className="program-details">
                <p><strong>Coverage:</strong> School fees, uniforms, books</p>
                <p><strong>Application:</strong> January - March annually</p>
                <p><strong>Criteria:</strong> Academic merit and financial need</p>
              </div>
            </div>
            <div className="card education-card">
              <BookOpen className="education-icon" />
              <h4>Adult Literacy</h4>
              <p>Basic literacy and numeracy classes for adults in English and IsiNdebele</p>
              <div className="program-details">
                <p><strong>When:</strong> Tuesday & Thursday, 6:00 PM - 8:00 PM</p>
                <p><strong>Languages:</strong> English and IsiNdebele</p>
                <p><strong>Free:</strong> All materials provided</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <p><strong>Education Coordinator:</strong> Sister Mary Ncube</p>
            <p>📞 +263 77 555 1234 | 📧 education@stpatricksmakokoba.org</p>
          </div>
        </div>
      </section>

      {/* Archdiocese Connection */}
      <section className="archdiocese-section section-padding">
        <div className="container">
          <div className="card archdiocese-card">
            <h3>Bulawayo Archdiocese Partnership</h3>
            <p>Our outreach programs are coordinated with the Bulawayo Archdiocese to ensure maximum impact and avoid duplication of services.</p>
            <div className="archdiocese-links">
              <div className="link-item">
                <h4>Education Secretariat</h4>
                <p>Coordination with diocesan education programs and Catholic schools in Bulawayo</p>
              </div>
              <div className="link-item">
                <h4>Social Services Department</h4>
                <p>Collaboration on community development and social justice initiatives</p>
              </div>
              <div className="link-item">
                <h4>Health Commission</h4>
                <p>Partnership in health education and medical outreach programs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Involved */}
      <section className="involvement-section bg-light section-padding">
        <div className="container">
          <h2 className="text-center mb-4">How You Can Help</h2>
          <div className="grid grid-2">
            <div className="involvement-card">
              <h3>Volunteer Opportunities</h3>
              <ul className="volunteer-list">
                <li>Tutoring and teaching assistance</li>
                <li>Food distribution and preparation</li>
                <li>Administrative support</li>
                <li>Counseling and pastoral care (trained volunteers)</li>
                <li>Community outreach and home visits</li>
                <li>Event organization and coordination</li>
              </ul>
              <p><strong>Volunteer Coordinator:</strong> Mr. Thabo Moyo</p>
              <p>📞 +263 77 888 9999</p>
            </div>
            <div className="involvement-card">
              <h3>Donation Needs</h3>
              <div className="donation-categories">
                <div className="donation-category">
                  <h4>Food Items</h4>
                  <p>Non-perishable foods, cooking oil, sugar, mealie meal</p>
                </div>
                <div className="donation-category">
                  <h4>Educational Supplies</h4>
                  <p>Books, stationery, school uniforms, calculators</p>
                </div>
                <div className="donation-category">
                  <h4>Medical Supplies</h4>
                  <p>First aid supplies, over-the-counter medications</p>
                </div>
                <div className="donation-category">
                  <h4>Financial Support</h4>
                  <p>Monthly pledges, one-time donations, scholarship sponsorships</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="emergency-section">
        <div className="container">
          <div className="emergency-card">
            <h3>🚨 Emergency Assistance</h3>
            <p>For urgent community needs or crisis situations, contact our emergency response team:</p>
            <div className="emergency-contacts">
              <p><strong>Emergency Hotline:</strong> +263 77 000 1111 (24/7)</p>
              <p><strong>Parish Priest:</strong> Fr. Joseph Sibanda - +263 77 222 3333</p>
              <p><strong>Caritas Emergency:</strong> +263 77 444 5555</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Outreach;
