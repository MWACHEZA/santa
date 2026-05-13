import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, RefreshCw, Tag, Search, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const GalleryCategoryManager: React.FC = () => {
  const { fullGalleryCategories, addCategory, deleteCategory, fetchCategories } = useAdmin();
  const { success, error } = useToast();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories('gallery');
  }, [fetchCategories]);

  const filtered = fullGalleryCategories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      error('Category name is required', 'Validation');
      return;
    }
    setLoading(true);
    try {
      await addCategory(name, 'gallery', newCategoryDescription.trim() || undefined);
      success(`Category "${name}" added successfully`, 'Gallery Categories');
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsAdding(false);
    } catch (err: any) {
      error(err.message || 'Failed to add category', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setLoading(true);
    try {
      await deleteCategory(id, 'gallery');
      success(`Category "${name}" removed`, 'Gallery Categories');
      setConfirmDeleteId(null);
    } catch (err: any) {
      error(err.message || 'Failed to delete category', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchCategories('gallery');
      success('Categories refreshed', 'Gallery Categories');
    } catch {
      error('Failed to refresh categories', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gallery-category-manager-container" style={styles.container}>
      {/* Header */}
      <div className="gcm-header" style={styles.header}>
        <div>
          <h2 style={styles.title}><Tag size={22} style={{ marginRight: 10 }} />Gallery Categories</h2>
          <p style={styles.subtitle}>
            Manage image categories for the parish gallery. 
            These categories are used to organize photos on the website.
          </p>
        </div>
        <div className="gcm-header-actions" style={styles.headerActions}>
          <button style={styles.refreshBtn} onClick={handleRefresh} disabled={loading} title="Refresh">
            <RefreshCw size={16} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
          <button style={styles.addBtn} onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div style={styles.addForm}>
          <h3 style={styles.formTitle}>New Gallery Category</h3>
          <div className="gcm-form-row" style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category Name *</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. Easter 2024, Youth Seminar, Choir Concert..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description (optional)</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Brief description of this photo set"
                value={newCategoryDescription}
                onChange={e => setNewCategoryDescription(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
          </div>
          <div className="gcm-form-actions" style={styles.formActions}>
            <button style={styles.cancelBtn} onClick={() => { setIsAdding(false); setNewCategoryName(''); setNewCategoryDescription(''); }}>
              Cancel
            </button>
            <button style={styles.saveBtn} onClick={handleAdd} disabled={loading || !newCategoryName.trim()}>
              {loading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={styles.searchBar}>
        <Search size={16} style={styles.searchIcon} />
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <span style={styles.countBadge}>{filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Category Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyCell}>
                  {searchTerm ? (
                    <>No categories matching "<strong>{searchTerm}</strong>"</>
                  ) : (
                    <>No gallery categories yet. Add one above to get started.</>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((cat, idx) => (
                <tr key={cat.id} style={{ ...styles.row, ...(idx % 2 === 0 ? styles.rowEven : {}) }}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    <span style={styles.catName}>{cat.name}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.description}>{cat.description || <em style={{ color: '#9ca3af' }}>—</em>}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={cat.is_active ? styles.badgeActive : styles.badgeInactive}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {confirmDeleteId === cat.id ? (
                      <div style={styles.confirmRow}>
                        <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                        <span style={styles.confirmText}>Delete?</span>
                        <button
                          style={styles.confirmYes}
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={loading}
                        >
                          Yes
                        </button>
                        <button
                          style={styles.confirmNo}
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => setConfirmDeleteId(cat.id)}
                        title={`Delete "${cat.name}"`}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .gallery-category-manager-container {
            padding: 1rem !important;
          }

          .gcm-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }

          .gcm-header-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            width: 100% !important;
            gap: 0.5rem !important;
          }

          .gcm-header-actions button {
            width: 100% !important;
            justify-content: center !important;
          }

          .gcm-form-row {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .gcm-form-actions {
            flex-direction: column !important;
            width: 100% !important;
            gap: 0.5rem !important;
          }

          .gcm-form-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#2d5016',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '0.88rem',
    marginTop: '0.4rem',
    maxWidth: '600px',
    lineHeight: 1.5,
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexShrink: 0,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.25rem',
    background: 'linear-gradient(135deg, #2d5016, #4ecdc4)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.875rem',
    boxShadow: '0 2px 8px rgba(45,80,22,0.3)',
  },
  addForm: {
    background: '#f0f9f4',
    border: '2px solid #2d5016',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  formTitle: {
    margin: '0 0 1rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#2d5016',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    padding: '0.65rem 0.9rem',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'white',
    color: '#1f2937',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  cancelBtn: {
    padding: '0.55rem 1.25rem',
    background: 'white',
    color: '#374151',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  saveBtn: {
    padding: '0.55rem 1.5rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: '#f3f4f6',
    borderRadius: '10px',
    padding: '0.6rem 1rem',
    border: '1px solid #e5e7eb',
  },
  searchIcon: {
    color: '#9ca3af',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: '0.9rem',
    color: '#1f2937',
    outline: 'none',
  },
  countBadge: {
    background: '#2d5016',
    color: 'white',
    padding: '0.2rem 0.65rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  tableWrapper: {
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    display: 'block',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '650px',
  },
  thead: {
    background: '#f8fafc',
  },
  th: {
    padding: '0.85rem 1rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  row: {
    transition: 'background 0.15s',
  },
  rowEven: {
    background: '#fafafa',
  },
  td: {
    padding: '0.9rem 1rem',
    fontSize: '0.88rem',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle',
  },
  catName: {
    fontWeight: 700,
    color: '#2d5016',
  },
  description: {
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  badgeActive: {
    background: '#dcfce7',
    color: '#166534',
    padding: '0.2rem 0.65rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'inline-block',
  },
  badgeInactive: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '0.2rem 0.65rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'inline-block',
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#374151',
  },
  confirmYes: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '0.2rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  confirmNo: {
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '5px',
    padding: '0.2rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  emptyCell: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
};

export default GalleryCategoryManager;
