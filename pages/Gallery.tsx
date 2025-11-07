import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Camera, Users, Church, Heart, Crown, Cross, Flower2, Image } from 'lucide-react';
import './Gallery.css';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  description: string;
  uploadDate: string;
}

interface SubGroup {
  id: string;
  name: string;
  images: GalleryImage[];
}

interface GalleryGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  subGroups: SubGroup[];
}

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [activeGroup, setActiveGroup] = useState<string>('mass');
  const [activeSubGroup, setActiveSubGroup] = useState<string>('palm-sunday');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Sample data - in real implementation, this would come from admin uploads
  const galleryGroups: GalleryGroup[] = [
    {
      id: 'mass',
      name: 'Mass',
      icon: <Church size={24} />,
      subGroups: [
        {
          id: 'palm-sunday',
          name: 'Palm Sunday',
          images: [
            {
              id: 1,
              url: '/api/placeholder/400/300',
              title: 'Palm Sunday Procession 2024',
              description: 'Parishioners carrying palm branches during the Palm Sunday procession',
              uploadDate: '2024-03-24'
            },
            {
              id: 2,
              url: '/api/placeholder/400/300',
              title: 'Blessing of Palms',
              description: 'Father blessing the palm branches before the procession',
              uploadDate: '2024-03-24'
            }
          ]
        },
        {
          id: 'baptism',
          name: 'Baptism',
          images: [
            {
              id: 3,
              url: '/api/placeholder/400/300',
              title: 'Infant Baptism Ceremony',
              description: 'Beautiful baptism ceremony for our newest members',
              uploadDate: '2024-12-01'
            }
          ]
        },
        {
          id: 'confirmation',
          name: 'Confirmation',
          images: [
            {
              id: 4,
              url: '/api/placeholder/400/300',
              title: 'Confirmation Class 2024',
              description: 'Young adults receiving the sacrament of confirmation',
              uploadDate: '2024-11-15'
            }
          ]
        }
      ]
    },
    {
      id: 'association',
      name: 'Association',
      icon: <Users size={24} />,
      subGroups: [
        {
          id: 'cya',
          name: 'CYA (Catholic Youth Association)',
          images: [
            {
              id: 5,
              url: '/api/placeholder/400/300',
              title: 'CYA Youth Rally',
              description: 'Annual youth rally and fellowship gathering',
              uploadDate: '2024-10-20'
            }
          ]
        },
        {
          id: 'st-anne',
          name: 'St. Anne',
          images: [
            {
              id: 6,
              url: '/api/placeholder/400/300',
              title: 'St. Anne Society Meeting',
              description: 'Monthly meeting of the St. Anne Society',
              uploadDate: '2024-11-10'
            }
          ]
        },
        {
          id: 'sacred-heart',
          name: 'Sacred Heart',
          images: [
            {
              id: 7,
              url: '/api/placeholder/400/300',
              title: 'Sacred Heart Devotion',
              description: 'First Friday Sacred Heart devotion service',
              uploadDate: '2024-12-06'
            }
          ]
        },
        {
          id: 'st-joseph',
          name: 'St. Joseph',
          images: [
            {
              id: 8,
              url: '/api/placeholder/400/300',
              title: 'St. Joseph Society Feast',
              description: 'Celebration of St. Joseph feast day',
              uploadDate: '2024-03-19'
            }
          ]
        },
        {
          id: 'sodality',
          name: 'Sodality of Our Lady',
          images: [
            {
              id: 9,
              url: '/api/placeholder/400/300',
              title: 'Marian Procession',
              description: 'Annual Marian procession by the Sodality',
              uploadDate: '2024-05-31'
            }
          ]
        },
        {
          id: 'cwl',
          name: 'Catholic Women\'s League (CWL)',
          images: [
            {
              id: 10,
              url: '/api/placeholder/400/300',
              title: 'CWL Charity Drive',
              description: 'Women\'s league organizing charity for the community',
              uploadDate: '2024-08-15'
            }
          ]
        }
      ]
    },
    {
      id: 'liturgical-ministry',
      name: 'Liturgical Ministry',
      icon: <Cross size={24} />,
      subGroups: [
        {
          id: 'hospitality-ministers',
          name: 'Hospitality (CYA) Ministers',
          images: [
            {
              id: 11,
              url: '/api/placeholder/400/300',
              title: 'CYA Hospitality Team',
              description: 'Young adults serving as hospitality ministers during Mass',
              uploadDate: '2024-11-20'
            }
          ]
        },
        {
          id: 'sacristans',
          name: 'Sacristans',
          images: [
            {
              id: 12,
              url: '/api/placeholder/400/300',
              title: 'Sacristan Preparation',
              description: 'Sacristans preparing the altar for Mass',
              uploadDate: '2024-10-15'
            }
          ]
        },
        {
          id: 'eucharistic-ministers',
          name: 'Eucharistic Ministers',
          images: [
            {
              id: 13,
              url: '/api/placeholder/400/300',
              title: 'Eucharistic Ministers',
              description: 'Extraordinary ministers of Holy Communion serving the parish',
              uploadDate: '2024-09-30'
            }
          ]
        },
        {
          id: 'altar-servers',
          name: 'Altar Servers',
          images: [
            {
              id: 14,
              url: '/api/placeholder/400/300',
              title: 'Altar Servers Training',
              description: 'Young altar servers learning their duties',
              uploadDate: '2024-08-25'
            }
          ]
        },
        {
          id: 'choir',
          name: 'Choir',
          images: [
            {
              id: 15,
              url: '/api/placeholder/400/300',
              title: 'Parish Choir Performance',
              description: 'Our beautiful parish choir during Sunday Mass',
              uploadDate: '2024-12-08'
            }
          ]
        }
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <Heart size={24} />,
      subGroups: [
        {
          id: 'community-projects',
          name: 'Community Projects',
          images: [
            {
              id: 16,
              url: '/api/placeholder/400/300',
              title: 'Church Renovation',
              description: 'Recent church renovation and beautification project',
              uploadDate: '2024-09-01'
            }
          ]
        }
      ]
    },
    {
      id: 'clergy',
      name: 'Clergy Pictures',
      icon: <Cross size={24} />,
      subGroups: [
        {
          id: 'parish-priests',
          name: 'Parish Priests',
          images: [
            {
              id: 17,
              url: '/api/placeholder/400/300',
              title: 'Father Joseph Sibanda',
              description: 'Our beloved Parish Priest',
              uploadDate: '2024-01-01'
            }
          ]
        }
      ]
    }
  ];

  const getCurrentGroup = () => galleryGroups.find(g => g.id === activeGroup);
  const getCurrentSubGroup = () => getCurrentGroup()?.subGroups.find(sg => sg.id === activeSubGroup);

  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    const group = galleryGroups.find(g => g.id === groupId);
    if (group && group.subGroups.length > 0) {
      setActiveSubGroup(group.subGroups[0].id);
    }
  };

  return (
    <div className="gallery section-padding">
      <div className="container">
        <div className="gallery-header">
          <h1 className="text-center mb-4">{t('gallery.title')}</h1>
          <p className="text-center mb-5">{t('gallery.subtitle')}</p>
        </div>

        {/* Group Tabs */}
        <div className="gallery-tabs">
          {galleryGroups.map((group) => (
            <button
              key={group.id}
              className={`gallery-tab ${activeGroup === group.id ? 'active' : ''}`}
              onClick={() => handleGroupChange(group.id)}
            >
              {group.icon}
              <span>{group.name}</span>
            </button>
          ))}
        </div>

        {/* SubGroup Navigation */}
        {getCurrentGroup() && (
          <div className="subgroup-nav">
            <h3>Select Category:</h3>
            <div className="subgroup-buttons">
              {getCurrentGroup()!.subGroups.map((subGroup) => (
                <button
                  key={subGroup.id}
                  className={`subgroup-btn ${activeSubGroup === subGroup.id ? 'active' : ''}`}
                  onClick={() => setActiveSubGroup(subGroup.id)}
                >
                  {subGroup.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery */}
        <div className="images-section">
          {getCurrentSubGroup() ? (
            <>
              <h2 className="section-title">{getCurrentSubGroup()!.name}</h2>
              {getCurrentSubGroup()!.images.length > 0 ? (
                <div className="images-grid">
                  {getCurrentSubGroup()!.images.map((image) => (
                    <div
                      key={image.id}
                      className="image-card"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="image-container">
                        <img src={image.url} alt={image.title} />
                        <div className="image-overlay">
                          <Camera size={24} />
                          <span>View</span>
                        </div>
                      </div>
                      <div className="image-info">
                        <h4>{image.title}</h4>
                        <p>{image.description}</p>
                        <span className="image-date">
                          {new Date(image.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-images">
                  <Image size={64} />
                  <h3>No Images Yet</h3>
                  <p>Images for this category will be uploaded by the admin soon.</p>
                </div>
              )}
            </>
          ) : (
            <div className="no-category">
              <Flower2 size={64} />
              <h3>Select a Category</h3>
              <p>Choose a category above to view images.</p>
            </div>
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="image-modal" onClick={() => setSelectedImage(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedImage(null)}>
                ×
              </button>
              <img src={selectedImage.url} alt={selectedImage.title} />
              <div className="modal-info">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.description}</p>
                <span className="modal-date">
                  {new Date(selectedImage.uploadDate).toLocaleDateString()}
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
