import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { Newspaper, Globe, Church, Calendar, ExternalLink, X, Archive } from 'lucide-react';
import './News.css';

const News: React.FC = () => {
  const { 
    getPublishedParishNews, 
    externalNews, 
    fetchExternalNews,
    getNewsArchiveByYear,
    newsArchive
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState<'parish' | 'diocese' | 'vatican' | 'zimbabwe' | 'archive'>('parish');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Get data
  const parishNews = getPublishedParishNews();
  const dioceseNews = externalNews.filter(n => n.source === 'diocese');
  const vaticanNews = externalNews.filter(n => n.source === 'vatican');
  const zimbabweNews = externalNews.filter(n => n.source === 'zimbabwe_catholic');
  const archiveNews = getNewsArchiveByYear(selectedYear);

  // Available years for archive
  const availableYears = Array.from(new Set(newsArchive.map(n => n.year))).sort((a, b) => b - a);

  // Fetch external news on component mount and tab change
  useEffect(() => {
    if (activeTab === 'diocese') {
      fetchExternalNews('diocese');
    } else if (activeTab === 'vatican') {
      fetchExternalNews('vatican');
    } else if (activeTab === 'zimbabwe') {
      fetchExternalNews('zimbabwe_catholic');
    }
  }, [activeTab, fetchExternalNews]);

  const handleReadMore = (article: any, isExternal = false) => {
    if (isExternal) {
      // Open external link in new tab
      window.open(article.externalUrl, '_blank');
    } else {
      // Show modal for parish news
      setSelectedArticle(article);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };

  const renderNewsCard = (article: any, isExternal = false) => (
    <div key={article.id} className="news-card">
      {article.imageUrl && (
        <div className="news-image">
          <img src={article.imageUrl} alt={article.title} />
        </div>
      )}
      <div className="news-content">
        <div className="news-meta">
          <span className="news-date">
            <Calendar size={16} />
            {new Date(isExternal ? article.publishedAt : article.publishedAt).toLocaleDateString()}
          </span>
          {!isExternal && article.authorRole && (
            <span className="news-author">
              By {article.author} ({article.authorRole.replace('_', ' ')})
            </span>
          )}
          {isExternal && (
            <span className="news-source">
              <ExternalLink size={16} />
              {article.source === 'diocese' ? 'Archdiocese of Bulawayo' :
               article.source === 'vatican' ? 'Vatican News' :
               'ZCBC'}
            </span>
          )}
        </div>
        <h3>{article.title}</h3>
        <p className="news-summary">{article.summary}</p>
        <button 
          className="btn btn-primary btn-small"
          onClick={() => handleReadMore(article, isExternal)}
        >
          {isExternal ? 'Read Full Article' : 'Read More'}
          {isExternal && <ExternalLink size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="news-page">
      <div className="container">
        <div className="page-header">
          <h1>
            <Newspaper size={32} />
            Church News & Updates
          </h1>
          <p>Stay informed with the latest news from our parish and the Catholic Church worldwide</p>
        </div>

        {/* News Tabs */}
        <div className="news-tabs">
          <button 
            className={`tab ${activeTab === 'parish' ? 'active' : ''}`}
            onClick={() => setActiveTab('parish')}
          >
            <Church size={20} />
            Parish News
          </button>
          <button 
            className={`tab ${activeTab === 'diocese' ? 'active' : ''}`}
            onClick={() => setActiveTab('diocese')}
          >
            <Globe size={20} />
            Diocese News
          </button>
          <button 
            className={`tab ${activeTab === 'vatican' ? 'active' : ''}`}
            onClick={() => setActiveTab('vatican')}
          >
            <Globe size={20} />
            Vatican News
          </button>
          <button 
            className={`tab ${activeTab === 'zimbabwe' ? 'active' : ''}`}
            onClick={() => setActiveTab('zimbabwe')}
          >
            <Globe size={20} />
            Zimbabwe Catholic
          </button>
          <button 
            className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            <Archive size={20} />
            News Archive
          </button>
        </div>

        {/* News Content */}
        <div className="news-content-area">
          {activeTab === 'parish' && (
            <div className="news-section">
              <h2>Parish News</h2>
              {parishNews.length > 0 ? (
                <div className="news-grid">
                  {parishNews.map(article => renderNewsCard(article, false))}
                </div>
              ) : (
                <div className="empty-state">
                  <Newspaper size={48} />
                  <h3>No Parish News Available</h3>
                  <p>Check back later for updates from our parish community.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'diocese' && (
            <div className="news-section">
              <h2>Archdiocese of Bulawayo News</h2>
              {dioceseNews.length > 0 ? (
                <div className="news-grid">
                  {dioceseNews.map(article => renderNewsCard(article, true))}
                </div>
              ) : (
                <div className="empty-state">
                  <Globe size={48} />
                  <h3>Loading Diocese News...</h3>
                  <p>Fetching the latest updates from the Archdiocese of Bulawayo.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vatican' && (
            <div className="news-section">
              <h2>Vatican News</h2>
              {vaticanNews.length > 0 ? (
                <div className="news-grid">
                  {vaticanNews.map(article => renderNewsCard(article, true))}
                </div>
              ) : (
                <div className="empty-state">
                  <Globe size={48} />
                  <h3>Loading Vatican News...</h3>
                  <p>Fetching the latest updates from Vatican News.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'zimbabwe' && (
            <div className="news-section">
              <h2>Zimbabwe Catholic Bishops Conference</h2>
              {zimbabweNews.length > 0 ? (
                <div className="news-grid">
                  {zimbabweNews.map(article => renderNewsCard(article, true))}
                </div>
              ) : (
                <div className="empty-state">
                  <Globe size={48} />
                  <h3>Loading ZCBC News...</h3>
                  <p>Fetching the latest updates from Zimbabwe Catholic Bishops Conference.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="news-section">
              <div className="archive-header">
                <h2>News Archive</h2>
                {availableYears.length > 0 && (
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="year-selector"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
              </div>
              {archiveNews.length > 0 ? (
                <div className="news-grid">
                  {archiveNews.map(article => (
                    <div key={article.id} className="news-card archive-card">
                      {article.imageUrl && (
                        <div className="news-image">
                          <img src={article.imageUrl} alt={article.title} />
                        </div>
                      )}
                      <div className="news-content">
                        <div className="news-meta">
                          <span className="news-date">
                            <Calendar size={16} />
                            {new Date(article.originalPublishDate).toLocaleDateString()}
                          </span>
                          <span className="news-author">By {article.author}</span>
                          <span className="archive-badge">Archived</span>
                        </div>
                        <h3>{article.title}</h3>
                        <p className="news-summary">{article.summary}</p>
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => handleReadMore(article, false)}
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Archive size={48} />
                  <h3>No Archived News</h3>
                  <p>No archived news available for {selectedYear}.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Article Modal */}
      {showModal && selectedArticle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedArticle.title}</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {selectedArticle.imageUrl && (
                <div className="modal-image">
                  <img src={selectedArticle.imageUrl} alt={selectedArticle.title} />
                </div>
              )}
              <div className="modal-meta">
                <span className="modal-date">
                  <Calendar size={16} />
                  {new Date(selectedArticle.publishedAt || selectedArticle.originalPublishDate).toLocaleDateString()}
                </span>
                <span className="modal-author">
                  By {selectedArticle.author}
                  {selectedArticle.authorRole && ` (${selectedArticle.authorRole.replace('_', ' ')})`}
                </span>
              </div>
              <div className="modal-content-text">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
