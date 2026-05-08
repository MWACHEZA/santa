import React, { useEffect, useState } from 'react';
import { useAdmin, AuditLog } from '../../contexts/AdminContext';
import { 
  History, Search, Filter, Download, User, 
  Tag, Calendar, Clock, ChevronLeft, ChevronRight, 
  Activity, AlertCircle
} from 'lucide-react';
import './AuditLogViewer.css';

const AuditLogViewer: React.FC = () => {
  const { auditLogs, fetchAuditLogs } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userRole: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  useEffect(() => {
    fetchAuditLogs({ limit: 100 });
  }, [fetchAuditLogs]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = !filters.entityType || log.entityType === filters.entityType;
    const matchesAction = !filters.action || log.action.includes(filters.action);
    const matchesRole = !filters.userRole || log.userRole === filters.userRole;

    return matchesSearch && matchesEntity && matchesAction && matchesRole;
  });

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'badge-create';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'badge-update';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'badge-delete';
    return 'badge-info';
  };

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user': return <User size={14} />;
      case 'announcement': return <Activity size={14} />;
      case 'event': return <Calendar size={14} />;
      case 'finance': case 'transaction': return <Tag size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Entity', 'Details'];
    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.userRole,
      log.action,
      log.entityType,
      log.details.replace(/,/g, ';')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `parish_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audit-log-viewer animate-fade-in">
      <div className="section-header">
        <div className="header-info">
          <h2><History size={24} /> Centralized Audit Logs</h2>
          <p>Monitor all administrative actions and security events across the portal.</p>
        </div>
        <button className="btn btn-outline" onClick={exportToCSV}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="log-controls">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search logs by user, action or details..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select 
              value={filters.entityType} 
              onChange={(e) => setFilters({...filters, entityType: e.target.value})}
            >
              <option value="">All Entities</option>
              <option value="announcement">Announcements</option>
              <option value="event">Events</option>
              <option value="user">Users</option>
              <option value="finance">Finance</option>
              <option value="ministry">Ministries</option>
              <option value="priest_desk">Priest's Desk</option>
            </select>
          </div>

          <div className="filter-item">
            <select 
              value={filters.userRole} 
              onChange={(e) => setFilters({...filters, userRole: e.target.value})}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="priest">Priest</option>
              <option value="secretary">Secretary</option>
              <option value="treasurer">Treasurer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="logs-table-container card">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin / User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr key={log.id}>
                <td className="time-cell">
                  <div className="date-time">
                    <span className="date"><Calendar size={12} /> {new Date(log.timestamp).toLocaleDateString()}</span>
                    <span className="time"><Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td className="user-cell">
                  <div className="user-info">
                    <span className="user-name">{log.userName}</span>
                    <span className={`user-role role-${log.userRole}`}>{log.userRole}</span>
                  </div>
                </td>
                <td>
                  <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="entity-cell">
                  <div className="entity-info">
                    {getEntityIcon(log.entityType)}
                    <span className="entity-type">{log.entityType}</span>
                    <span className="entity-id">#{log.entityId.substring(0, 8)}</span>
                  </div>
                </td>
                <td className="details-cell">
                  <p title={log.details}>{log.details}</p>
                </td>
                <td className="ip-cell">
                  <code>{log.ipAddress || 'Internal'}</code>
                </td>
              </tr>
            ))}
            
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  <AlertCircle size={40} />
                  <p>No audit logs found matching your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="p-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button 
            className="p-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
