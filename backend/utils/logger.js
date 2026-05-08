const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Log an action to the audit_logs table
 * @param {Object} data - Log data
 * @param {string} data.userId - ID of the user performing the action
 * @param {string} data.action - Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
 * @param {string} data.entityType - Type of entity acted upon (e.g., 'news', 'event', 'stream')
 * @param {string} data.entityId - ID of the entity acted upon
 * @param {string} data.details - JSON string or text with more details
 * @param {string} data.ipAddress - IP address of the user
 */
const logAction = async (data) => {
  try {
    const { userId, action, entityType, entityId, details, ipAddress } = data;
    const id = uuidv4();
    
    await db.execute(`
      INSERT INTO audit_logs (
        id, user_id, action, entity_type, entity_id, details, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id, userId || null, action, entityType || null, 
      entityId || null, details || null, ipAddress || null
    ]);
    
    return true;
  } catch (error) {
    console.error('Audit logging failed:', error);
    return false;
  }
};

module.exports = { logAction };
