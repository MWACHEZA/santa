const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requirePriest } = require('../middleware/auth');

const router = express.Router();

// Get all priest messages
router.get('/', async (req, res) => {
  try {
    const [messages] = await db.execute(`
      SELECT 
        pm.*,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM priest_messages pm
      LEFT JOIN users u ON pm.author_id = u.id
      ORDER BY pm.date DESC
    `);
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get priest messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});


// Create new priest message
router.post('/', authenticateToken, requirePriest, async (req, res) => {
  try {
    const { title, content, date, isPublished, imageUrl } = req.body;
    const id = uuidv4();
    
    await db.execute(
      'INSERT INTO priest_messages (id, title, content, date, is_published, image_url, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, content, date || new Date(), isPublished === true, imageUrl || null, req.user.id]
    );

    const [newMessage] = await db.execute('SELECT * FROM priest_messages WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      data: newMessage[0]
    });
  } catch (error) {
    console.error('Create priest message error:', error);
    res.status(500).json({ success: false, message: 'Failed to create message' });
  }
});

// Update priest message
router.put('/:id', authenticateToken, requirePriest, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, date, isPublished, imageUrl } = req.body;

    await db.execute(
      'UPDATE priest_messages SET title = ?, content = ?, date = ?, is_published = ?, image_url = ? WHERE id = ?',
      [title, content, date, isPublished === true, imageUrl || null, id]
    );

    const [updatedMessage] = await db.execute('SELECT * FROM priest_messages WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updatedMessage[0]
    });
  } catch (error) {
    console.error('Update priest message error:', error);
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
});

// Delete priest message
router.delete('/:id', authenticateToken, requirePriest, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM priest_messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete priest message error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

module.exports = router;
