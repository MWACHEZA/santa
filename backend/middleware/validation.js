const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const validateId = param('id').isUUID().withMessage('Invalid ID format');

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['asc', 'desc']).withMessage('Sort must be asc or desc'),
];

// User validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^(\+263|0)(7[0-9]|8[6-9])[0-9]{7}$/)
    .withMessage('Invalid Zimbabwe phone number format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('emergencyContact')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must be less than 100 characters'),
  body('emergencyPhone')
    .optional()
    .matches(/^(\+263|0)(7[0-9]|8[6-9])[0-9]{7}$/)
    .withMessage('Invalid Zimbabwe phone number format'),
  body('role')
    .optional()
    .isIn(['admin', 'priest', 'secretary', 'reporter', 'vice_secretary', 'parishioner'])
    .withMessage('Invalid role')
];

const validateUserLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'priest', 'secretary', 'reporter', 'vice_secretary', 'parishioner'])
    .withMessage('Invalid role'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

// News validation
const validateNews = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('summary')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Summary is required and must be less than 1000 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('author')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author is required and must be less than 100 characters'),
  body('author_role')
    .isIn(['priest', 'secretary', 'reporter', 'vice_secretary'])
    .withMessage('Invalid author role'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL')
];

// Event validation
const validateEvent = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('event_date')
    .isISO8601()
    .withMessage('Valid event date is required'),
  body('start_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('end_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Location must be less than 255 characters'),
  body('max_attendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean')
];

// Announcement validation
const validateAnnouncement = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('type')
    .isIn(['general', 'urgent', 'event', 'mass'])
    .withMessage('Invalid announcement type'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

// Gallery validation
const validateGallery = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('upload_date')
    .isISO8601()
    .withMessage('Valid upload date is required'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('event_id')
    .optional()
    .isUUID()
    .withMessage('Invalid event ID'),
  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean')
];

// Category validation
const validateCategory = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('type')
    .isIn(['news', 'event', 'ministry', 'sacrament', 'general'])
    .withMessage('Invalid category type'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

// Contact info validation
const validateContactInfo = [
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('emergency_contact')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid emergency contact format'),
  body('office_hours_weekday')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Office hours must be less than 100 characters'),
  body('office_hours_saturday')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Office hours must be less than 100 characters'),
  body('office_hours_sunday')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Office hours must be less than 100 characters')
];

// Mass schedule validation
const validateMassSchedule = [
  body('day_of_week')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('language')
    .optional()
    .isIn(['english', 'isindebele', 'both'])
    .withMessage('Invalid language'),
  body('type')
    .optional()
    .isIn(['mass', 'confession', 'adoration', 'rosary'])
    .withMessage('Invalid service type'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

// Prayer intention validation
const validatePrayerIntention = [
  body('intention')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Intention is required and must be less than 1000 characters'),
  body('requester_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Requester name must be less than 100 characters'),
  body('requester_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  body('is_urgent')
    .optional()
    .isBoolean()
    .withMessage('is_urgent must be a boolean')
];

// Ministry validation
const validateMinistry = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('leader_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Leader name must be less than 100 characters'),
  body('leader_contact')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Leader contact must be less than 100 characters'),
  body('meeting_schedule')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Meeting schedule must be less than 255 characters'),
  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Requirements must be less than 1000 characters'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

// Sacrament validation
const validateSacrament = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('requirements')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Requirements must be less than 1000 characters'),
  body('preparation_time')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Preparation time must be less than 100 characters'),
  body('contact_person')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Contact person must be less than 100 characters'),
  body('contact_info')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Contact info must be less than 255 characters'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
];

module.exports = {
  handleValidationErrors,
  validateId,
  validatePagination,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateNews,
  validateEvent,
  validateAnnouncement,
  validateGallery,
  validateCategory,
  validateContactInfo,
  validateMassSchedule,
  validatePrayerIntention,
  validateMinistry,
  validateSacrament
};
