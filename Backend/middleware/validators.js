import { body, query, param, validationResult } from 'express-validator'

// Sends a 422 if any validation rule failed
export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

// ── Expert validators ──
export const validateGetExperts = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('category')
    .optional()
    .isIn(['Technology', 'Business', 'Design', 'Health', 'Education', 'Marketing', 'Finance', 'Legal'])
    .withMessage('Invalid category'),
  query('search').optional().isString().trim().isLength({ max: 100 }),
]

export const validateExpertId = [
  param('id').isMongoId().withMessage('Invalid expert ID'),
]

// ── Booking validators ──
export const validateCreateBooking = [
  body('expertId').isMongoId().withMessage('Invalid expert ID'),

  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number (10 digits, starts with 6-9)'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format')
    .custom((val) => {
      const selected = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected < today) throw new Error('Booking date cannot be in the past')
      return true
    }),

  body('timeSlot')
    .trim()
    .notEmpty().withMessage('Time slot is required'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
]

export const validateUpdateStatus = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'completed'])
    .withMessage('Status must be pending, confirmed, or completed'),
]

export const validateGetBookings = [
  query('email')
    .notEmpty().withMessage('Email query parameter is required')
    .isEmail().withMessage('Invalid email address'),
]
