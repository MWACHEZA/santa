import React, { useState, useMemo } from 'react';
import { useAdmin, TransactionType, Currency, PaymentMethod } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import TreasuryCategoryManager from './TreasuryCategoryManager';
import { 
  Plus, Minus, TrendingUp, TrendingDown, DollarSign, 
  Calendar, FileText, User, Filter, Download, ArrowUpRight, ArrowDownRight,
  Wallet, Landmark, Smartphone, X, Tag
} from 'lucide-react';

const FinancialManager: React.FC = () => {
  const { financialTransactions, addTransaction, getAssociationFinance, getParishFinance, financialCategories, addCategory, logAdminAction } = useAdmin();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'categories'>('transactions');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const isGlobalFinAdmin = user?.role === 'admin' || user?.role === 'priest' || (user?.role === 'treasurer' && !user?.association && !user?.section);
  const canManageAll = isGlobalFinAdmin;

  const [associationFilter, setAssociationFilter] = useState<string>(
    isGlobalFinAdmin ? 'all' : (user?.association || user?.section || 'all')
  );
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
    associationId: user?.association || user?.section || 'parish',
    associationName: user?.association || user?.section || 'Parish General Fund'
  });

  
  const associationFinance = useMemo(() => {
    return associationFilter === 'all' ? getParishFinance() : getAssociationFinance(associationFilter);
  }, [associationFilter, getParishFinance, getAssociationFinance]);

  const filteredTransactions = useMemo(() => {
    return financialTransactions.filter(t => {
      const typeMatch = filter === 'all' || t.type === filter;
      const assocMatch = associationFilter === 'all' || t.associationId === associationFilter;
      return typeMatch && assocMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financialTransactions, filter, associationFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let finalCategory = formData.category;
      
      // Handle new category addition
      if (showNewCategoryInput && newCategoryName.trim()) {
        finalCategory = newCategoryName.trim();
        addCategory(finalCategory);
        logAdminAction('ADD_FINANCE_CATEGORY', 'finance', 'new', `Added new financial category: ${finalCategory}`);
      }

      addTransaction({
        associationId: formData.associationId,
        associationName: formData.associationName,
        entityType: formData.associationId === 'parish' ? 'parish' : 
                   (formData.associationId.toLowerCase().includes('section') ? 'section' : 'association'),
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
      logAdminAction(
        formData.type === 'income' ? 'ADD_INCOME' : 'ADD_EXPENSE',
        'finance',
        'new',
        `Recorded ${formData.type} of ${formData.amount} ${formData.currency} for ${formData.associationName} (${finalCategory})`
      );
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

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      error('No data to export', 'Export Error');
      return;
    }

    const headers = ['Date', 'Description', 'Account', 'Association', 'Category', 'Type', 'Amount', 'Currency', 'Recorded By'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.paymentMethod,
      t.associationName,
      t.category,
      t.type,
      t.amount,
      t.currency,
      t.recordedByName
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `parish_finance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Report exported as CSV (Excel compatible)', 'Export Success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="finance-manager">
      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '0.65rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'transactions' ? '3px solid #1e3a5f' : '3px solid transparent',
            color: activeTab === 'transactions' ? '#1e3a5f' : '#6b7280',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={16} /> Transactions
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.65rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'categories' ? '3px solid #1e3a5f' : '3px solid transparent',
            color: activeTab === 'categories' ? '#1e3a5f' : '#6b7280',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Tag size={16} /> Manage Categories
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && <TreasuryCategoryManager />}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
      <>
      <div className="finance-header no-print">
        {/* ... existing header ... */}
        <div className="header-title">
          <h2>Parish Treasury Management</h2>
          <p>Financial oversight and association funds</p>
        </div>
        <div className="multi-currency-balances">
          <div className="balance-group">
            <h3>Parish Totals</h3>
            <div className="balance-row">
              <div className="balance-card usd">
                <div className="card-icon"><DollarSign size={20} /></div>
                <div className="card-info">
                  <span className="label">USD</span>
                  <div className="amount">${associationFinance.totalBalance.USD.toLocaleString()}</div>
                </div>
              </div>
              <div className="balance-card zar">
                <div className="card-icon"><span className="currency-label">R</span></div>
                <div className="card-info">
                  <span className="label">Rand</span>
                  <div className="amount">R{associationFinance.totalBalance.ZAR.toLocaleString()}</div>
                </div>
              </div>
              <div className="balance-card zig">
                <div className="card-icon"><span className="currency-label">ZiG</span></div>
                <div className="card-info">
                  <span className="label">ZiG</span>
                  <div className="amount">{associationFinance.totalBalance.ZiG.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="account-summaries">
            <div className="account-card">
              <div className="account-header"><Wallet size={16} /> Cash on Hand</div>
              <div className="account-values">
                <span>${associationFinance.accountBalances.Cash.USD.toLocaleString()}</span>
                <span>R{associationFinance.accountBalances.Cash.ZAR.toLocaleString()}</span>
                <span>{associationFinance.accountBalances.Cash.ZiG.toLocaleString()} ZiG</span>
              </div>
            </div>
            <div className="account-card">
              <div className="account-header"><Smartphone size={16} /> Ecocash</div>
              <div className="account-values">
                <span>${associationFinance.accountBalances.Ecocash.USD.toLocaleString()}</span>
                <span>R{associationFinance.accountBalances.Ecocash.ZAR.toLocaleString()}</span>
                <span>{associationFinance.accountBalances.Ecocash.ZiG.toLocaleString()} ZiG</span>
              </div>
            </div>
            <div className="account-card">
              <div className="account-header"><Landmark size={16} /> Bank Accounts</div>
              <div className="account-values">
                <span>${associationFinance.accountBalances.Bank.USD.toLocaleString()}</span>
                <span>R{associationFinance.accountBalances.Bank.ZAR.toLocaleString()}</span>
                <span>{associationFinance.accountBalances.Bank.ZiG.toLocaleString()} ZiG</span>
              </div>
            </div>
          </div>
        </div>

        <div className="finance-controls">
          <div className="search-filters">
            <div className="filter-group">
              <Filter size={18} />
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
            {canManageAll && (
              <div className="filter-group">
                <User size={18} />
                <select value={associationFilter} onChange={(e) => setAssociationFilter(e.target.value)}>
                  <option value="all">Entire Parish Ecosystem (Audit View)</option>
                  <option value="parish">Parish General Fund</option>
                  {Array.from(new Set(financialTransactions.map(t => t.associationId))).filter(id => id !== 'parish' && id).map(id => (
                    <option key={id} value={id}>
                      {financialTransactions.find(t => t.associationId === id)?.associationName || id}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} />
            Record Transaction
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="transaction-form-overlay">
          <div className="transaction-form card">
            <h2>Record New Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value as TransactionType})}
                  >
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select 
                    value={formData.currency} 
                    onChange={(e) => setFormData({...formData, currency: e.target.value as Currency})}
                  >
                    <option value="USD">United States Dollar (USD)</option>
                    <option value="ZAR">South African Rand (ZAR)</option>
                    <option value="ZiG">Zimbabwe Gold (ZiG)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Account / Method</label>
                  <select 
                    value={formData.paymentMethod} 
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                  >
                    <option value="Cash">Cash Handled</option>
                    <option value="Ecocash">Ecocash Account</option>
                    <option value="Bank">Bank Account Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  {!showNewCategoryInput ? (
                    <select 
                      value={formData.category} 
                      onChange={handleCategoryChange}
                    >
                      {financialCategories.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="ADD_NEW">+ Add New Category...</option>
                    </select>
                  ) : (
                    <div className="input-group-modern">
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                      />
                      <button 
                        type="button"
                        className="btn-icon-close"
                        onClick={() => setShowNewCategoryInput(false)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {formData.category === 'Monthly Subscriptions' && (
                  <div className="form-group full-width">
                    <label>Member / Owner Name</label>
                    <div className="input-with-icon">
                      <User size={18} className="field-icon" />
                      <input 
                        type="text" 
                        required 
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        placeholder="Parishioner name for this subscription"
                        className="form-input-with-icon"
                      />
                    </div>
                  </div>
                )}
                {!canManageAll && (
                  <div className="form-group">
                    <label>Association</label>
                    <input type="text" value={formData.associationName} disabled />
                  </div>
                )}
                {canManageAll && (
                  <div className="form-group">
                    <label>Association / Section</label>
                    <select 
                      value={formData.associationId}
                      onChange={(e) => setFormData({...formData, associationId: e.target.value, associationName: e.target.options[e.target.selectedIndex].text})}
                    >
                      <optgroup label="Core Fund">
                        <option value="parish">Parish General Fund</option>
                      </optgroup>
                      <optgroup label="Associations">
                        <option value="Catholic Youth Association">Youth Association</option>
                        <option value="Catholic Women's League">Women's League</option>
                        <option value="Men's Fellowship">Men's Fellowship</option>
                      </optgroup>
                      <optgroup label="Sections">
                        <option value="St. Peters Section">St. Peters Section</option>
                        <option value="St. Pauls Section">St. Pauls Section</option>
                        <option value="Holy Family Section">Holy Family Section</option>
                        <option value="Divine Mercy Section">Divine Mercy Section</option>
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>
              <div className="form-group full-width">
                <label>Description / Note</label>
                <textarea 
                  required 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What was this money for?"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="transaction-history card">
        <div className="history-header">
          <h2>Transaction History {associationFilter !== 'all' && `(${associationFilter})`}</h2>
          <div className="export-actions no-print">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={handleExportCSV}>
              <Download size={18} />
              Export Excel
            </button>
            <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={handlePrint}>
              <FileText size={18} />
              Print Report (PDF)
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="finance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Description</th>
                <th>Account</th>
                <th>Association</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t, index) => (
                <tr key={t.id}>
                  <td className="id-cell">#{index + 1}</td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(t.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="description-cell">
                      <span className="desc-text">{t.description}</span>
                    </div>
                  </td>
                  <td>
                    <div className="account-cell">
                      {t.paymentMethod === 'Cash' && <Wallet size={14} />}
                      {t.paymentMethod === 'Bank' && <Landmark size={14} />}
                      {t.paymentMethod === 'Ecocash' && <Smartphone size={14} />}
                      <span>{t.paymentMethod}</span>
                    </div>
                  </td>
                  <td><span className="badge-assoc">{t.associationName}</span></td>
                  <td><span className="badge-cat">{t.category}</span></td>
                  <td>
                    <div className={`amount-cell ${t.type}`}>
                      {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>
                        {t.currency === 'USD' && '$'}
                        {t.currency === 'ZAR' && 'R'}
                        {t.amount.toLocaleString()} 
                        {t.currency === 'ZiG' && ' ZiG'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="recorder-cell">
                      <User size={14} />
                      {t.recordedByName}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center empty-row">
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .finance-manager {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .multi-currency-balances {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .balance-group h3 {
          font-size: 1.1rem;
          color: #4a5568;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .balance-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .balance-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border: 1px solid #edf2f7;
        }

        .balance-card.usd { border-top: 4px solid #2d5016; }
        .balance-card.zar { border-top: 4px solid #3182ce; }
        .balance-card.zig { border-top: 4px solid #e53e3e; }

        .card-icon {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          background: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2d5016;
          font-weight: 800;
        }

        .card-info .label {
          font-size: 0.75rem;
          color: #718096;
          text-transform: uppercase;
          display: block;
        }

        .amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: #2d3748;
        }

        .account-summaries {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .account-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .account-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px dashed #cbd5e1;
        }

        .account-values {
          display: flex;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          font-weight: 600;
          color: #475569;
        }

        .text-success { color: #10b981; }
        .text-danger { color: #ef4444; }

        .finance-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .search-filters {
          display: flex;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .filter-group select {
          border: none;
          background: none;
          font-weight: 500;
          color: #4a5568;
        }

        .finance-table {
          width: 100%;
          border-collapse: collapse;
        }

        .finance-table th {
          text-align: left;
          padding: 1rem;
          background: #f7fafc;
          color: #718096;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .finance-table td {
          padding: 1rem;
          border-bottom: 1px solid #edf2f7;
          color: #4a5568;
        }

        .amount-cell {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
        }

        .amount-cell.income { color: #10b981; }
        .amount-cell.expense { color: #ef4444; }

        .badge-assoc {
          background: #ebf8ff;
          color: #2b6cb0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-cat {
          background: #f7fafc;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #718096;
        }

        .transaction-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .transaction-form {
          width: 90%;
          max-width: 600px;
          padding: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .full-width { grid-column: span 2; }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #4a5568;
        }

        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        @media print {
          .no-print, .btn, .btn-icon, .finance-controls, .transaction-form-overlay, .header-title p, .export-actions {
            display: none !important;
          }
          
          body {
            background: white !important;
            padding: 0 !important;
          }

          .finance-manager {
            gap: 1rem !important;
            padding: 0 !important;
          }

          .transaction-history.card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }

          .history-header h2 {
            font-size: 1.8rem !important;
            margin-bottom: 1.5rem !important;
            color: black !important;
            text-align: center !important;
            width: 100% !important;
          }

          .finance-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          .finance-table th, .finance-table td {
            border: 1px solid #eee !important;
            padding: 10px !important;
            font-size: 10pt !important;
            text-align: left !important;
          }

          .amount-cell.income { color: #2d5016 !important; font-weight: bold !important; }
          .amount-cell.expense { color: #b91c1c !important; font-weight: bold !important; }
          
          .badge-assoc, .badge-cat {
            border: none !important;
            padding: 0 !important;
            background: none !important;
            color: black !important;
          }
        }
      `}</style>
      </>
      )}
    </div>
  );
};

export default FinancialManager;
