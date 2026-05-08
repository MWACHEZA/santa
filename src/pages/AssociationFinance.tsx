import React, { useMemo, useState } from 'react';
import { useAdmin, TransactionType, Currency, PaymentMethod } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Calendar, Wallet, Landmark, Smartphone,
  ArrowUpRight, ArrowDownRight, Info, Plus, X, Shield, User, Filter
} from 'lucide-react';
import './AssociationFinance.css';

const AssociationFinance: React.FC = () => {
  const { financialTransactions, getAssociationFinance, addTransaction, financialCategories, addCategory } = useAdmin();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    type: 'income' as TransactionType,
    amount: '',
    currency: 'USD' as Currency,
    paymentMethod: 'Cash' as PaymentMethod,
    category: 'Monthly Subscriptions',
    description: '',
    ownerName: '',
  });

  // Helper to format entity names (e.g., catholic-senior-youth-cya -> Catholic Senior Youth (CYA))
  const formatEntityName = (name: string) => {
    if (!name || name.toLowerCase() === 'parish') return 'Parish General Fund';
    const parts = name.split('-');
    return parts.map(word => {
      if (word.length <= 3) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  const userAssociation = user?.association;
  const userSection = user?.section;

  // Potential entities the user can manage
  const managedEntities = useMemo(() => {
    const entities: { id: string; name: string; type: 'association' | 'section' | 'parish' }[] = [];
    if (userAssociation) entities.push({ id: userAssociation, name: userAssociation, type: 'association' });
    if (userSection) entities.push({ id: userSection, name: userSection, type: 'section' });
    if (user?.role === 'treasurer' || user?.role === 'admin') {
      entities.push({ id: 'parish', name: 'Parish General Fund', type: 'parish' });
    }
    return entities;
  }, [userAssociation, userSection, user?.role]);

  const [activeEntityId, setActiveEntityId] = useState(managedEntities[0]?.id || 'parish');

  const activeEntity = useMemo(() => {
    return managedEntities.find(e => e.id === activeEntityId) || managedEntities[0] || { id: 'parish', name: 'Parish General Fund', type: 'parish' as const };
  }, [managedEntities, activeEntityId]);

  const entityId = activeEntity.id;
  const entityName = activeEntity.name;
  const entityType = activeEntity.type;

  // Determine if user has permission to manage finances for the active entity
  const isTreasurer = useMemo(() => {
    if (!user) return false;
    
    // Admins and globally assigned treasurers have access
    if (user.role === 'admin' || user.role === 'treasurer') return true;
    
    // For association-level, check if user is a treasurer/chairperson for this specific association
    if (activeEntity.type === 'association' && user.association === activeEntity.id) {
      const position = user.committeePosition?.toLowerCase() || '';
      return position.includes('treasurer') || position.includes('chairperson');
    }
    
    // Fallback: if they are a committee member in general (legacy support)
    return !!user.isCommitteeMember;
  }, [user, activeEntity]);

  const financeData = useMemo(() => {
    return getAssociationFinance(entityId);
  }, [entityId, getAssociationFinance]);

  const associationTransactions = useMemo(() => {
    return financialTransactions.filter(t =>
      t.associationId === entityId
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financialTransactions, entityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let finalCategory = formData.category;
      
      if (showNewCategoryInput && newCategoryName.trim()) {
        finalCategory = newCategoryName.trim();
        addCategory(finalCategory);
      }

      addTransaction({
        associationId: entityId,
        associationName: entityName,
        entityType: entityType,
        type: formData.type,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        category: finalCategory,
        description: formData.description,
        ownerName: formData.category === 'Monthly Subscriptions' ? formData.ownerName : undefined,
        recordedBy: user.id,
        recordedByName: `${user.firstName} ${user.lastName}`
      });

      success('Transaction recorded successfully!', 'Finance Update');
      setIsAdding(false);
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      setFormData({
        ...formData,
        amount: '',
        description: '',
        ownerName: ''
      });
    } catch (err) {
      error('Failed to record transaction', 'Finance Error');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'ADD_NEW') {
      setShowNewCategoryInput(true);
      setFormData({...formData, category: ''});
    } else {
      setShowNewCategoryInput(false);
      setFormData({...formData, category: val});
    }
  };

  return (
    <div className="page-container association-finance">
      <div className="container py-5">
        <div className="section-header mb-5 d-flex justify-content-between align-items-end">
          <div className="header-text">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="entity-badge">{entityType}</div>
            </div>
            <h1 className="display-5 fw-bold">{formatEntityName(entityName)}</h1>
            <p className="lead text-muted">Transparency and management for our community funds.</p>
          </div>
          <div className="d-flex flex-column align-items-end gap-3">
            {managedEntities.length > 1 && (
              <div className="entity-switcher no-print">
                <label className="form-label text-end mb-1" style={{ fontSize: '0.8rem' }}>Switch Managed Entity</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Filter size={16} />
                  </span>
                  <select 
                    className="form-select border-start-0 ps-0" 
                    value={activeEntityId}
                    onChange={(e) => setActiveEntityId(e.target.value)}
                    style={{ minWidth: '200px' }}
                  >
                    {managedEntities.map(ent => (
                      <option key={ent.id} value={ent.id}>
                        {ent.type === 'section' ? 'Section: ' : (ent.type === 'association' ? 'Association: ' : '')}
                        {ent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {isTreasurer && (
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setIsAdding(true)}
              >
                <Plus size={20} />
                Record Transaction
              </button>
            )}
          </div>
        </div>

        {!isTreasurer ? (
          <div className="alert-glass info mb-5">
            <div className="glass-icon"><Info size={24} /></div>
            <div className="glass-content">
              <strong>Read-Only View</strong>
              <p>This page provides a transparent look at your association's financial health. Only authorized treasurers can record new transactions.</p>
            </div>
          </div>
        ) : (
          <div className="alert-glass success mb-5">
            <div className="glass-icon"><Shield size={24} /></div>
            <div className="glass-content">
              <strong>Management Mode</strong>
              <p>You are authorized to manage funds for <strong>{formatEntityName(entityName)}</strong>.</p>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {isAdding && (
          <div className="modal-overlay">
            <div className="modal-content card shadow-lg p-4" style={{ maxWidth: '650px', width: '100%' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0">Record {formData.type === 'income' ? 'Income' : 'Expense'}</h2>
                <button className="btn-close" onClick={() => setIsAdding(false)}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select modern-select"
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                    >
                      <option value="income">Income (+)</option>
                      <option value="expense">Expense (-)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Currency</label>
                    <select 
                      className="form-select modern-select"
                      value={formData.currency} 
                      onChange={(e) => setFormData({...formData, currency: e.target.value as Currency})}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="ZAR">Rand (R)</option>
                      <option value="ZiG">ZiG</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Amount</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-input"
                      required 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Account</label>
                    <select 
                      className="form-select modern-select"
                      value={formData.paymentMethod} 
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Ecocash">Ecocash</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Category</label>
                    {!showNewCategoryInput ? (
                      <select 
                        className="form-select modern-select"
                        value={formData.category} 
                        onChange={handleCategoryChange}
                      >
                        {financialCategories.map((cat: string) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="ADD_NEW">+ Add New Category...</option>
                      </select>
                    ) : (
                      <div className="input-group mb-3">
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Enter new category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          autoFocus
                        />
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => setShowNewCategoryInput(false)}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {formData.category === 'Monthly Subscriptions' && (
                    <div className="col-md-12">
                      <label className="form-label">Member / Owner Name</label>
                      <div className="input-container">
                        <User className="input-icon" size={18} style={{ left: '15px', color: '#64748b' }} />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ paddingLeft: '45px' }}
                          required 
                          value={formData.ownerName}
                          onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                          placeholder="Who is paying this subscription?"
                        />
                      </div>
                      <small className="form-help text-muted">Enter the name of the parishioner paying this subscription</small>
                    </div>
                  )}

                  <div className="col-md-12">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-input"
                      required 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="What was this for?"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer-custom">
                  <button type="button" className="btn-premium-light" onClick={() => setIsAdding(false)}>Cancel</button>
                  <button type="submit" className="btn-premium-primary">Save Transaction</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="multi-currency-balances mb-5">
          <div className="balance-card usd">
            <div className="card-icon"><DollarSign size={24} /></div>
            <div className="card-info">
              <h3>USD Balance</h3>
              <div className="amount">${financeData.totalBalance.USD.toLocaleString()}</div>
            </div>
          </div>
          <div className="balance-card zar">
            <div className="card-icon"><div className="currency-label">R</div></div>
            <div className="card-info">
              <h3>ZAR Balance</h3>
              <div className="amount">R{financeData.totalBalance.ZAR.toLocaleString()}</div>
            </div>
          </div>
          <div className="balance-card zig">
            <div className="card-icon"><div className="currency-label">ZiG</div></div>
            <div className="card-info">
              <h3>ZiG Balance</h3>
              <div className="amount">{financeData.totalBalance.ZiG.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="transaction-history">
          <div className="history-header d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Recent Transactions</h2>
            <div className="text-muted small">Updated: {new Date(financeData.lastUpdated).toLocaleString()}</div>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                   <th>ID</th>
                   <th>Date</th>
                   <th>Description</th>
                   <th>Method</th>
                   <th>Category</th>
                   <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {associationTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No approved transactions found for this association.
                    </td>
                  </tr>
                ) : (
                  associationTransactions.map((t, index) => (
                    <tr key={t.id}>
                      <td className="text-muted small">#{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Calendar className="text-muted me-2" size={14} />
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{t.description}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center text-muted">
                          {t.paymentMethod === 'Cash' && <Wallet className="me-2" size={14} />}
                          {t.paymentMethod === 'Bank' && <Landmark className="me-2" size={14} />}
                          {t.paymentMethod === 'Ecocash' && <Smartphone className="me-2" size={14} />}
                          <span>{t.paymentMethod}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-light text-dark border`}>{t.category}</span>
                      </td>
                      <td className="text-end">
                        <div className={`d-flex align-items-center justify-content-end ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          <span className="fw-bold ms-1">
                            {t.currency === 'USD' && '$'}
                            {t.currency === 'ZAR' && 'R'}
                            {t.amount.toLocaleString()} 
                            {t.currency === 'ZiG' && ' ZiG'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssociationFinance;
