const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database-simple');
const { authenticateToken, requireContentManager } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directories exist
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const subDir = req.body.type || 'general';
    const fullPath = path.join(uploadPath, subDir);
    
    try {
      await ensureDirectoryExists(fullPath);
      cb(null, fullPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  }
});

// Upload single file
router.post('/single', authenticateToken, requireContentManager, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { type = 'general', description } = req.body;
    let processedFilePath = req.file.path;
    let thumbnailPath = null;
    
    // Process image files
    if (req.file.mimetype.startsWith('image/')) {
      try {
        // Create optimized version
        const optimizedPath = req.file.path.replace(path.extname(req.file.path), '_optimized' + path.extname(req.file.path));
        
        await sharp(req.file.path)
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .toFile(optimizedPath);
        
        // Create thumbnail
        thumbnailPath = req.file.path.replace(path.extname(req.file.path), '_thumb' + path.extname(req.file.path));
        
        await sharp(req.file.path)
          .resize(300, 200, { 
            fit: 'cover' 
          })
          .jpeg({ 
            quality: 80 
          })
          .toFile(thumbnailPath);
        
        // Use optimized version as main file
        await fs.unlink(req.file.path); // Remove original
        processedFilePath = optimizedPath;
        
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        // Continue with original file if processing fails
      }
    }
    
    // Save file info to database
    const fileId = uuidv4();
    const relativePath = path.relative(process.env.UPLOAD_PATH || './uploads', processedFilePath);
    const thumbnailRelativePath = thumbnailPath ? path.relative(process.env.UPLOAD_PATH || './uploads', thumbnailPath) : null;
    
    await db.execute(`
      INSERT INTO file_uploads (
        id, original_name, filename, file_path, file_size, 
        mime_type, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      fileId,
      req.file.originalname,
      req.file.filename,
      relativePath,
      req.file.size,
      req.file.mimetype,
      req.user.id
    ]);
    
    // Construct URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
    const thumbnailUrl = thumbnailRelativePath ? `${baseUrl}/uploads/${thumbnailRelativePath.replace(/\\/g, '/')}` : null;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: fileId,
        originalName: req.file.originalname,
        filename: req.file.filename,
        url: fileUrl,
        thumbnailUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
        type
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

// Upload multiple files
router.post('/multiple', authenticateToken, requireContentManager, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const { type = 'general' } = req.body;
    const uploadedFiles = [];
    
    for (const file of req.files) {
      try {
        let processedFilePath = file.path;
        let thumbnailPath = null;
        
        // Process image files
        if (file.mimetype.startsWith('image/')) {
          try {
            // Create optimized version
            const optimizedPath = file.path.replace(path.extname(file.path), '_optimized' + path.extname(file.path));
            
            await sharp(file.path)
              .resize(1920, 1080, { 
                fit: 'inside', 
                withoutEnlargement: true 
              })
              .jpeg({ 
                quality: 85, 
                progressive: true 
              })
              .toFile(optimizedPath);
            
            // Create thumbnail
            thumbnailPath = file.path.replace(path.extname(file.path), '_thumb' + path.extname(file.path));
            
            await sharp(file.path)
              .resize(300, 200, { 
                fit: 'cover' 
              })
              .jpeg({ 
                quality: 80 
              })
              .toFile(thumbnailPath);
            
            // Use optimized version as main file
            await fs.unlink(file.path); // Remove original
            processedFilePath = optimizedPath;
            
          } catch (imageError) {
            console.error('Image processing error:', imageError);
            // Continue with original file if processing fails
          }
        }
        
        // Save file info to database
        const fileId = uuidv4();
        const relativePath = path.relative(process.env.UPLOAD_PATH || './uploads', processedFilePath);
        const thumbnailRelativePath = thumbnailPath ? path.relative(process.env.UPLOAD_PATH || './uploads', thumbnailPath) : null;
        
        await db.execute(`
          INSERT INTO file_uploads (
            id, original_name, filename, file_path, file_size, 
            mime_type, uploaded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          fileId,
          file.originalname,
          file.filename,
          relativePath,
          file.size,
          file.mimetype,
          req.user.id
        ]);
        
        // Construct URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;
        const thumbnailUrl = thumbnailRelativePath ? `${baseUrl}/uploads/${thumbnailRelativePath.replace(/\\/g, '/')}` : null;
        
        uploadedFiles.push({
          id: fileId,
          originalName: file.originalname,
          filename: file.filename,
          url: fileUrl,
          thumbnailUrl,
          size: file.size,
          mimeType: file.mimetype,
          type
        });
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        
        // Clean up file on error
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }
    
    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    });
    
  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

// Get uploaded files
router.get('/', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const mimeType = req.query.mimeType;
    
    let whereCondition = '';
    let queryParams = [];
    
    if (mimeType) {
      whereCondition = 'WHERE mime_type LIKE ?';
      queryParams.push(`${mimeType}%`);
    }
    
    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM file_uploads ${whereCondition}`,
      queryParams
    );
    const total = countResult[0].total;
    
    // Get files
    const [files] = await db.execute(`
      SELECT 
        f.id,
        f.original_name,
        f.filename,
        f.file_path,
        f.file_size,
        f.mime_type,
        f.upload_date,
        u.username as uploaded_by_username
      FROM file_uploads f
      LEFT JOIN users u ON f.uploaded_by = u.id
      ${whereCondition}
      ORDER BY f.upload_date DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);
    
    // Add URLs to files
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const filesWithUrls = files.map(file => ({
      ...file,
      url: `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/')}`,
      thumbnailUrl: file.mime_type.startsWith('image/') ? 
        `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/').replace(path.extname(file.file_path), '_thumb' + path.extname(file.file_path))}` : 
        null
    }));
    
    res.json({
      success: true,
      data: {
        files: filesWithUrls,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
});

// Delete uploaded file
router.delete('/:id', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get file info
    const [files] = await db.execute(
      'SELECT file_path, mime_type FROM file_uploads WHERE id = ?',
      [id]
    );
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = files[0];
    const fullPath = path.join(process.env.UPLOAD_PATH || './uploads', file.file_path);
    
    // Delete physical files
    try {
      await fs.unlink(fullPath);
      
      // Delete thumbnail if it exists (for images)
      if (file.mime_type.startsWith('image/')) {
        const thumbnailPath = fullPath.replace(path.extname(fullPath), '_thumb' + path.extname(fullPath));
        try {
          await fs.unlink(thumbnailPath);
        } catch (thumbError) {
          console.error('Error deleting thumbnail:', thumbError);
        }
      }
    } catch (fileError) {
      console.error('Error deleting physical file:', fileError);
    }
    
    // Delete from database
    await db.execute('DELETE FROM file_uploads WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Get file info
router.get('/:id', authenticateToken, requireContentManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [files] = await db.execute(`
      SELECT 
        f.id,
        f.original_name,
        f.filename,
        f.file_path,
        f.file_size,
        f.mime_type,
        f.upload_date,
        u.username as uploaded_by_username
      FROM file_uploads f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.id = ?
    `, [id]);
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const file = files[0];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    res.json({
      success: true,
      data: {
        file: {
          ...file,
          url: `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/')}`,
          thumbnailUrl: file.mime_type.startsWith('image/') ? 
            `${baseUrl}/uploads/${file.file_path.replace(/\\/g, '/').replace(path.extname(file.file_path), '_thumb' + path.extname(file.file_path))}` : 
            null
        }
      }
    });
    
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file info'
    });
  }
});

module.exports = router;
