const { body, param, query, validationResult } = require('express-validator');

const currentYear = new Date().getFullYear();

const studentCreateRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('course').trim().notEmpty().withMessage('Course is required').isLength({ max: 100 }),
  body('year').notEmpty().withMessage('Year is required').isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (dob > new Date()) throw new Error('Date of birth cannot be in the future');
      if (age > 100) throw new Error('Date of birth is not valid');
      return true;
    }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid').normalizeEmail(),
  body('mobile_number')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[0-9+\-\s]{7,15}$/).withMessage('Mobile number must be 7-15 digits'),
  body('gender').trim().notEmpty().withMessage('Gender is required').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female or Other'),
  body('address').trim().notEmpty().withMessage('Address is required').isLength({ max: 500 }),
];

const studentUpdateRules = studentCreateRules; // same shape for PUT (full update)

const idParamRule = [param('id').isInt({ min: 1 }).withMessage('Invalid student id')];

const listQueryRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().isLength({ max: 100 }),
  query('course').optional().trim().isLength({ max: 100 }),
  query('year').optional().isInt({ min: 1, max: 6 }).toInt(),
  query('sortBy').optional().isIn(['name', 'course', 'year', 'created_at', 'admission_number']),
  query('sortDir').optional().isIn(['asc', 'desc']),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = {
  studentCreateRules,
  studentUpdateRules,
  idParamRule,
  listQueryRules,
  validate,
};
