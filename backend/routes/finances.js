const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { logAction } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all transactions (filtered by entity if needed)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { entityId, entityType } = req.query;
    let query = 'SELECT * FROM financial_transactions';
    const params = [];

    if (entityId || entityType) {
      query += ' WHERE 1=1';
      if (entityId) {
        query += ' AND entity_id = ?';
        params.push(entityId);
      }
      if (entityType) {
        query += ' AND entity_type = ?';
        params.push(entityType);
      }
    }

    query += ' ORDER BY date DESC';
    
    const [transactions] = await db.execute(query, params);
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

// Create new transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      entityId, entityName, entityType, type, amount, 
      currency, paymentMethod, category, description, ownerName,
      date, recordedByName 
    } = req.body;
    
    const id = uuidv4();
    
    await db.execute(
      `INSERT INTO financial_transactions (
        id, entity_id, entity_name, entity_type, type, amount, 
        currency, payment_method, category, description, owner_name, 
        date, recorded_by, recorded_by_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        entityId || null, 
        entityName || null, 
        entityType || 'parish', 
        type, 
        amount,
        currency || 'USD', 
        paymentMethod || 'Cash', 
        category || 'General', 
        description || null, 
        ownerName || null,
        date || new Date(), 
        req.user.id, 
        recordedByName || null, 
        'approved'
      ]
    );

    // Log action
    await logAction({
      userId: req.user.id,
      action: 'CREATE_TRANSACTION',
      entityType: 'finance',
      entityId: id,
      details: `Recorded ${type} of ${amount} ${currency} for ${entityName}`,
      ipAddress: req.ip
    });

    const [newTransaction] = await db.execute('SELECT * FROM financial_transactions WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: newTransaction[0]
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Failed to record transaction' });
  }
});

// Update transaction status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(
      'UPDATE financial_transactions SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

module.exports = router;
