import { body } from 'express-validator';
import { handleInputErrors } from './errors.js'; // ✅ Import existing error handler

// ✅ Validation rules for user registration
export const validateRegisterUser = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),

  body('licenseNumber')
    .isLength({ min: 6, max: 6 })
    .withMessage('License number must be exactly 6 digits')
    .isNumeric()
    .withMessage('License number must contain only numbers'),

  body('role')
    .isIn(['doctor', 'pharmacist'])
    .withMessage('Invalid role. Choose "doctor" or "pharmacist"'),

  handleInputErrors, // ✅ Use existing error handler instead of repeating logic
];
