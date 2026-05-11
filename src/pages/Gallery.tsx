import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

import { useAdmin } from '../contexts/AdminContext';
import {
  Camera, Users, Church, Heart, Crown, Music,
  Flower2, Image, Grid, Star
} from 'lucide-react';

import './Gallery.css';

// Auto-assign icons to category names dynamically
const ICON_POOL = [
  <Church size={20} />,
  <Crown size={20} />,
  <Users size={20} />,
  <Music size={20} />,
  <Heart size={20} />,
  <Star size={20} />,
  <Flower2 size={20} />,
  <Camera size={20} />,
];

const getIconForIndex = (index: number) =>
  ICON_POOL[index % ICON_POOL.length];

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const { getPublishedImages, galleryCategories } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  // Get only published images from the backend
  const publishedImages = getPublishedImages();

  // Build category list: "All" first, then DB categories
  const allTab = { id: 'all', name: 'All Photos', icon: <Grid size={20} /> };
  const dynamicTabs = galleryCategories.map((cat, idx) => ({
    id: cat,
    name: cat,
    icon: getIconForIndex(idx),
  }));
  const tabs = [allTab, ...dynamicTabs];

  // Set default to first real category when they load in
  useEffect(() => {
    if (galleryCategories.length > 0 && activeCategory === 'all') {
      // keep "All" as default — no change needed
    }
  }, [galleryCategories]);

  // Filter images for the active tab
  const activeImages =
    activeCategory === 'all'
      ? publishedImages
      : publishedImages.filter(
          (img) =>
            (img.category || '').toLowerCase() === activeCategory.toLowerCase()
        );

  const activeName = tabs.find((t) => t.id === activeCategory)?.name ?? 'Gallery';

  return (
    <div className="gallery section-padding">
      <div className="container">
        <div className="gallery-header">
          <h1 className="text-center mb-4">{t('gallery.title')}</h1>
          <p className="text-center mb-5">{t('gallery.subtitle')}</p>
        </div>

        {/* Category Tabs — from database */}
        {tabs.length > 1 && (
          <div className="gallery-tabs">
            {tabs.map((cat) => (
              <button
                key={cat.id}
                className={`gallery-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Image Gallery */}
        <div className="images-section">
          <h2 className="section-title">{activeName}</h2>

          {activeImages.length > 0 ? (
            <div className="images-grid">
              {activeImages.map((image) => (
                <div
                  key={image.id}
                  className="image-card"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="image-container" style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    {image.url ? (
                      <>
                        {/* Blurred background backup layer */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '-10px',
                            right: '-10px',
                            bottom: '-10px',
                            backgroundImage: `url(${image.url})`,
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
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            zIndex: 2,
                          }}
                        />
                      </>
                    ) : (
                      /* Shown when image fails to load or is empty */
                      <div
                        className="img-error-placeholder"
                        style={{
                          position: 'absolute', inset: 0,
                          background: '#f0f4f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          color: '#aaa',
                          fontSize: '0.8rem',
                          zIndex: 2
                        }}
                      >
                        <span style={{ fontSize: '2rem' }}>🖼️</span>
                        <span>Image unavailable</span>
                      </div>
                    )}
                    <div className="image-overlay" style={{ zIndex: 10 }}>
                      <Camera size={24} />
                      <span>View</span>
                    </div>
                  </div>
                  <div className="image-info">
                    <h4>{image.title}</h4>
                    {image.description && <p>{image.description}</p>}
                    <span className="image-date">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-images">
              <Image size={64} />
              <h3>No Images Yet</h3>
              <p>
                {activeCategory === 'all'
                  ? 'No published images are available yet. Check back soon!'
                  : `No images have been added to the "${activeName}" category yet.`}
              </p>
            </div>
          )}
        </div>

        {/* Image Lightbox Modal */}
        {selectedImage && (
          <div className="image-modal" onClick={() => setSelectedImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedImage(null)}>
                ×
              </button>
              <img src={selectedImage.url} alt={selectedImage.title} />
              <div className="modal-info">
                <h3>{selectedImage.title}</h3>
                {selectedImage.description && <p>{selectedImage.description}</p>}
                <span className="modal-date">
                  {new Date(selectedImage.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
