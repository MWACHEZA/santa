import React, { useState } from 'react';
import { useAdmin, PriestMessage } from '../../contexts/AdminContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  FileText, Plus, Trash2, Edit2, CheckCircle, 
  XCircle, Calendar, Image as ImageIcon, MessageSquare, Upload, X 
} from 'lucide-react';
import api from '../../services/api';

const PriestDeskManager: React.FC = () => {
  const { priestMessages, addPriestMessage, updatePriestMessage, deletePriestMessage, logAdminAction } = useAdmin();
  const { success, error } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    isPublished: false
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalImageUrl = editingId ? formData.imageUrl : '';

      // 1. Upload image if a new file was selected
      if (uploadedFile) {
        try {
          const uploadRes = await api.upload.uploadSingle(uploadedFile, 'priest-desk');
          if (uploadRes.success && uploadRes.data) {
            finalImageUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path;
          }
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          error('Failed to upload image', 'Upload Error');
          return;
        }
      }

      const submissionData = {
        ...formData,
        imageUrl: finalImageUrl
      };

      if (editingId) {
        await updatePriestMessage(editingId, submissionData);
        logAdminAction('UPDATE_PRIEST_MESSAGE', 'priest_desk', editingId, `Updated priest message: ${formData.title}`);
        success('Message updated successfully', 'Priest\'s Desk');
      } else {
        await addPriestMessage(submissionData);
        logAdminAction(
          'CREATE_PRIEST_MESSAGE', 
          'priest_desk', 
          'new', 
          `Published ${formData.isPublished ? 'message' : 'draft'}: ${formData.title}`
        );
        success(formData.isPublished ? 'New message published' : 'Message saved as draft', 'Priest\'s Desk');
      }
      resetForm();
    } catch (err) {
      error('Failed to save message', 'Error');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      date: new Date().toISOString().split('T')[0],
      isPublished: false
    });
    setUploadedFile(null);
    setUploadPreview('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (msg: PriestMessage) => {
    setFormData({
      title: msg.title,
      content: msg.content,
      imageUrl: msg.imageUrl || '',
      date: msg.date,
      isPublished: msg.isPublished
    });
    setUploadPreview(msg.imageUrl || '');
    setEditingId(msg.id);
    setIsAdding(true);
  };

  return (
    <div className="priest-desk-manager">
      <div className="section-header">
        <div className="header-text">
          <h2>From the Priest's Desk</h2>
          <p>Manage weekly spiritual reflections and official messages from the Parish Priest.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          New Message
        </button>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal rectangular">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Message' : 'Compose New Message'}</h3>
              <button className="btn-close" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-group">
                  <label>Message Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Reflection on the 5th Sunday of Lent"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Publication Date</label>
                    <div className="input-with-icon">
                      <Calendar size={18} />
                      <input 
                        type="date" 
                        required 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label><ImageIcon size={16} /> Featured Image</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <div 
                        className="upload-zone"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('drag-over');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('drag-over');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('drag-over');
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            const event = { target: { files: [file] } } as any;
                            handleFileUpload(event);
                          }
                        }}
                      >
                        {uploadPreview ? (
                          <div className="upload-preview">
                            <img src={uploadPreview} alt="Preview" />
                            <div className="upload-overlay">
                              <Upload size={24} />
                              <span>Click to change</span>
                            </div>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <Upload size={32} />
                            <span>Drop image here or click to browse</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea 
                    required 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Write the Priest's message here..."
                    rows={8}
                  />
                </div>

                <div className="form-options">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    />
                    <span className="checkmark"></span>
                    Publish immediately
                  </label>
                </div>

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {editingId 
                      ? (formData.isPublished ? 'Update & Publish' : 'Update Draft') 
                      : (formData.isPublished ? 'Publish Message' : 'Save as Draft')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="message-list grid">
        {priestMessages.map(msg => (
          <div
            key={msg.id}
            className={`message-card card ${!msg.isPublished ? 'draft' : ''}`}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {/* Premium image container: entire image fits, gaps are filled with a gorgeous matching blur */}
            {(msg.imageUrl || (msg as any).image_url) && (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  minHeight: '200px',
                  maxHeight: '200px',
                  flexShrink: 0,
                  flexGrow: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#1a1a1a', // premium dark background
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                    backgroundImage: `url(${msg.imageUrl || (msg as any).image_url})`,
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
                    backgroundImage: `url(${msg.imageUrl || (msg as any).image_url})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: 2,
                  }}
                />
              </div>
            )}


            <div style={{ padding: '1.25rem', flex: 1 }}>
              <div style={{ marginBottom: '0.5rem' }}>
                {msg.isPublished ? (
                  <span className="status-badge published">Published</span>
                ) : (
                  <span className="status-badge draft">Draft</span>
                )}
              </div>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--primary-green)' }}>{msg.title}</h4>
              <div className="msg-meta">
                <span><Calendar size={14} /> {new Date(msg.date).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#6c757d', fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.content.substring(0, 120)}...</p>
              <div className="msg-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="btn-icon" onClick={() => handleEdit(msg)} title="Edit">
                  <Edit2 size={18} />
                </button>
                <button className="btn-icon delete" onClick={() => {
                  deletePriestMessage(msg.id);
                  logAdminAction('DELETE_PRIEST_MESSAGE', 'priest_desk', msg.id, `Deleted priest message: ${msg.title}`);
                }} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}




        {priestMessages.length === 0 && !isAdding && (
          <div className="empty-state card full-width">
            <MessageSquare size={48} />
            <h3>No messages yet</h3>
            <p>Start by creating the first dynamic message from the Priest's Desk.</p>
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>Create Message</button>
          </div>
        )}
      </div>

      <style>{`
        .priest-desk-manager {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h2 { color: #2d5016; margin-bottom: 0.25rem; }
        .header-text p { color: #718096; }

        .message-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          align-items: start;
        }

        .message-card {
          padding: 0;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s;
          overflow: hidden;
          border-radius: 12px;
        }

        .msg-image-container,
        .msg-image-box {
          width: 100%;
          height: 200px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .msg-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transition: transform 0.3s ease;
        }

        .message-card:hover .msg-card-image {
          transform: scale(1.05);
        }

        .message-card:hover { transform: translateY(-4px); }
        .message-card.draft { border-style: dashed; opacity: 0.8; }

        .status-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.published { background: #def7ec; color: #03543f; }
        .status-badge.draft { background: #fef3c7; color: #92400e; }

        .msg-info h4 { color: #2d3748; margin-bottom: 0.5rem; font-size: 1.1rem; }
        .msg-meta { display: flex; gap: 1rem; color: #a0aec0; font-size: 0.85rem; margin-bottom: 0.75rem; }
        .msg-meta span { display: flex; align-items: center; gap: 0.4rem; }

        .msg-preview {
          color: #4a5568;
          font-size: 0.9rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .msg-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #edf2f7;
        }

        .btn-icon.delete:hover { color: #e53e3e; background: #fff5f5; }

        .upload-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          max-width: 400px;
          margin: 0 auto;
          width: 100%;
          min-height: 200px;
        }

        .upload-zone:hover, .upload-zone.drag-over {
          border-color: #2d5016;
          background: #f0f9f4;
          transform: translateY(-2px);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #718096;
        }

        .upload-preview {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-preview img {
          max-width: 100%;
          max-height: 250px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .upload-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 8px;
        }

        .upload-preview:hover .upload-overlay { opacity: 1; }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PriestDeskManager;
