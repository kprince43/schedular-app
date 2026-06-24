import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
      }));
      sendError(res, 'Validation failed', 422, formattedErrors);
      return;
    }
    next();
  };
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must include uppercase, lowercase, and a number'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
];

export const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// ── Schedule ──────────────────────────────────────────────────────────────────
const VALID_STATUSES   = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const VALID_CATEGORIES = ['WORK', 'PERSONAL', 'HEALTH', 'EDUCATION', 'FINANCE', 'SOCIAL', 'OTHER'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const VALID_SORT_FIELDS = ['createdAt', 'updatedAt', 'startTime', 'endTime', 'title', 'priority', 'status'];

export const createScheduleValidation = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 100 }).withMessage('Title must be 2–100 characters'),
  body('description').optional({ nullable: true }).trim()
    .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('category').optional()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('priority').optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('status').optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('startTime').notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').notEmpty().withMessage('End time is required')
    .isISO8601().withMessage('End time must be a valid ISO 8601 date')
    .custom((endTime, { req }) => {
      if (new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
];

export const updateScheduleValidation = [
  body('title').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Title must be 2–100 characters'),
  body('description').optional({ nullable: true }).trim()
    .isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('category').optional()
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('priority').optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('status').optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('startTime').optional()
    .isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').optional()
    .isISO8601().withMessage('End time must be a valid ISO 8601 date')
    .custom((endTime, { req }) => {
      if (endTime && req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
];

export const listSchedulesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100').toInt(),
  query('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status filter'),
  query('category').optional().isIn(VALID_CATEGORIES).withMessage('Invalid category filter'),
  query('priority').optional().isIn(VALID_PRIORITIES).withMessage('Invalid priority filter'),
  query('sortBy').optional().isIn(VALID_SORT_FIELDS).withMessage(`sortBy must be one of: ${VALID_SORT_FIELDS.join(', ')}`),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
  query('startDate').optional().isISO8601().withMessage('startDate must be valid ISO 8601'),
  query('endDate').optional().isISO8601().withMessage('endDate must be valid ISO 8601'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search too long'),
];
