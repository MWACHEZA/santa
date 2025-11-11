const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Ensure upload directories exist
const ensureDirectories = async () => {
  const directories = [
    'uploads/images',
    'uploads/videos', 
    'uploads/audio',
    'uploads/documents',
    'uploads/thumbnails'
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Initialize directories
ensureDirectories();

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath += 'audio/';
    } else {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Get file type from mimetype
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
};

// Process image files
const processImage = async (filePath, filename) => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Create thumbnail for images
    const thumbnailPath = `uploads/thumbnails/thumb_${filename}`;
    await image
      .resize(300, 300, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Optimize original image
    const optimizedPath = `uploads/images/opt_${filename}`;
    await image
      .jpeg({ quality: 85, progressive: true })
      .toFile(optimizedPath);

    return {
      width: metadata.width,
      height: metadata.height,
      thumbnailPath,
      optimizedPath
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
};

// Process video files
const processVideo = async (filePath, filename) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('Error getting video metadata:', err);
        resolve(null);
        return;
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const duration = metadata.format.duration;

      // Create video thumbnail
      const thumbnailPath = `uploads/thumbnails/thumb_${path.parse(filename).name}.jpg`;
      
      ffmpeg(filePath)
        .screenshots({
          timestamps: ['10%'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '300x300'
        })
        .on('end', () => {
          resolve({
            width: videoStream ? videoStream.width : null,
            height: videoStream ? videoStream.height : null,
            duration: Math.round(duration),
            thumbnailPath
          });
        })
        .on('error', (error) => {
          console.error('Error creating video thumbnail:', error);
          resolve({
            width: videoStream ? videoStream.width : null,
            height: videoStream ? videoStream.height : null,
            duration: Math.round(duration),
            thumbnailPath: null
          });
        });
    });
  });
};

// Process audio files
const processAudio = async (filePath, filename) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('Error getting audio metadata:', err);
        resolve(null);
        return;
      }

      const duration = metadata.format.duration;
      resolve({
        duration: Math.round(duration)
      });
    });
  });
};

// Save file information to database
const saveFileToDatabase = async (fileInfo, userId) => {
  try {
    const query = `
      INSERT INTO media_files (
        id, filename, original_filename, file_path, file_url, file_type, 
        mime_type, file_size, width, height, duration, uploaded_by, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const fileId = uuidv4();
    const fileUrl = `/uploads/${fileInfo.file_type}s/${fileInfo.filename}`;

    const values = [
      fileId,
      fileInfo.filename,
      fileInfo.originalname,
      fileInfo.path,
      fileUrl,
      fileInfo.file_type,
      fileInfo.mimetype,
      fileInfo.size,
      fileInfo.width || null,
      fileInfo.height || null,
      fileInfo.duration || null,
      userId
    ];

    await db.execute(query, values);

    return {
      id: fileId,
      filename: fileInfo.filename,
      originalFilename: fileInfo.originalname,
      fileUrl: fileUrl,
      fileType: fileInfo.file_type,
      mimeType: fileInfo.mimetype,
      fileSize: fileInfo.size,
      width: fileInfo.width,
      height: fileInfo.height,
      duration: fileInfo.duration,
      thumbnailUrl: fileInfo.thumbnailPath ? `/uploads/thumbnails/${path.basename(fileInfo.thumbnailPath)}` : null
    };
  } catch (error) {
    console.error('Error saving file to database:', error);
    throw error;
  }
};

// Main upload middleware
const uploadMiddleware = upload.array('files', 10);

// Process uploaded files
const processUploadedFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const processedFiles = [];
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    for (const file of req.files) {
      const fileType = getFileType(file.mimetype);
      let processedData = {};

      // Process based on file type
      switch (fileType) {
        case 'image':
          processedData = await processImage(file.path, file.filename);
          break;
        case 'video':
          processedData = await processVideo(file.path, file.filename);
          break;
        case 'audio':
          processedData = await processAudio(file.path, file.filename);
          break;
        default:
          processedData = {};
      }

      // Prepare file info for database
      const fileInfo = {
        ...file,
        file_type: fileType,
        ...processedData
      };

      // Save to database
      const savedFile = await saveFileToDatabase(fileInfo, userId);
      processedFiles.push(savedFile);
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('Error processing uploaded files:', error);
    res.status(500).json({ 
      error: 'Error processing uploaded files',
      details: error.message 
    });
  }
};

// Get file by ID
const getFileById = async (fileId) => {
  try {
    const query = `
      SELECT * FROM media_files 
      WHERE id = ? AND is_public = true
    `;
    
    const [rows] = await db.execute(query, [fileId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting file by ID:', error);
    throw error;
  }
};

// Delete file
const deleteFile = async (fileId, userId) => {
  try {
    // Get file info first
    const query = `
      SELECT * FROM media_files 
      WHERE id = ? AND (uploaded_by = ? OR ? IN (
        SELECT id FROM users WHERE role IN ('admin', 'priest')
      ))
    `;
    
    const [rows] = await db.execute(query, [fileId, userId, userId]);
    const file = rows[0];

    if (!file) {
      throw new Error('File not found or access denied');
    }

    // Delete physical files
    try {
      await fs.unlink(file.file_path);
      
      // Delete thumbnail if exists
      if (file.file_type === 'image' || file.file_type === 'video') {
        const thumbnailPath = `uploads/thumbnails/thumb_${file.filename}`;
        try {
          await fs.unlink(thumbnailPath);
        } catch (err) {
          // Thumbnail might not exist, ignore error
        }
      }
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    // Delete from database
    const deleteQuery = `DELETE FROM media_files WHERE id = ?`;
    await db.execute(deleteQuery, [fileId]);

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Update file metadata
const updateFileMetadata = async (fileId, metadata, userId) => {
  try {
    const allowedFields = ['alt_text', 'caption', 'description', 'is_public', 'is_featured'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(metadata)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(fileId, userId, userId);

    const query = `
      UPDATE media_files 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = ? AND (uploaded_by = ? OR ? IN (
        SELECT id FROM users WHERE role IN ('admin', 'priest')
      ))
    `;

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error('File not found or access denied');
    }

    return true;
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
};

// Get files with pagination and filters
const getFiles = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      fileType = null,
      userId = null,
      isPublic = true,
      search = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];

    if (isPublic !== null) {
      conditions.push('is_public = ?');
      values.push(isPublic);
    }

    if (fileType) {
      conditions.push('file_type = ?');
      values.push(fileType);
    }

    if (userId) {
      conditions.push('uploaded_by = ?');
      values.push(userId);
    }

    if (search) {
      conditions.push('(original_filename LIKE ? OR alt_text LIKE ? OR caption LIKE ?)');
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const query = `
      SELECT 
        mf.*,
        u.first_name,
        u.last_name
      FROM media_files mf
      LEFT JOIN users u ON mf.uploaded_by = u.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    values.push(limit, offset);

    const [rows] = await db.execute(query, values);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM media_files mf
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, values.slice(0, -2));
    const total = countResult[0].total;

    return {
      files: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
};

module.exports = {
  uploadMiddleware,
  processUploadedFiles,
  getFileById,
  deleteFile,
  updateFileMetadata,
  getFiles,
  ensureDirectories
};
