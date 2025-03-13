import { body, param } from 'express-validator';

// Common Fields
const patientFields = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required.')
    .bail()
    .isString()
    .withMessage('First name must be a string.'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required.')
    .bail()
    .isString()
    .withMessage('Last name must be a string.'),

  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required.')
    .bail()
    .isISO8601()
    .withMessage('Date of birth must be a valid ISO8601 date.'),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required.')
    .bail()
    .isString()
    .withMessage('Gender must be a string.'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required.')
    .bail()
    .isString()
    .withMessage('Phone number must be a string.'),

  body('email').optional().isEmail().withMessage('Invalid email format.').normalizeEmail(),

  body('address.street')
    .notEmpty()
    .withMessage('Street is required.')
    .bail()
    .isString()
    .withMessage('Street must be a string.'),

  body('address.city')
    .notEmpty()
    .withMessage('City is required.')
    .bail()
    .isString()
    .withMessage('City must be a string.'),

  body('address.postalCode')
    .notEmpty()
    .withMessage('Postal code is required.')
    .bail()
    .isString()
    .withMessage('Postal code must be a string.'),

  body('address.country')
    .notEmpty()
    .withMessage('Country is required.')
    .bail()
    .isString()
    .withMessage('Country must be a string.'),

  body('medicalHistory')
    .optional()
    .isArray()
    .withMessage('Medical history must be an array if provided.'),

  body('medicalHistory.*.condition')
    .optional()
    .isString()
    .withMessage('Medical condition must be a string if provided.'),

  body('medicalHistory.*.diagnosedAt')
    .optional()
    .isISO8601()
    .withMessage('Diagnosis date must be a valid date.'),

  body('medicalHistory.*.notes')
    .optional()
    .isString()
    .withMessage('Medical notes must be a string if provided.'),

  body('doctorId').isMongoId().withMessage('Invalid doctor ID format.'),
];

// Emergency Contact Fields
const emergencyContactFields = [
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required.')
    .bail()
    .isString()
    .withMessage('Emergency contact name must be a string.'),

  body('emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required.')
    .bail()
    .isString()
    .withMessage('Relationship must be a string.'),

  body('emergencyContact.phoneNumber')
    .notEmpty()
    .withMessage('Emergency contact phone number is required.')
    .bail()
    .isString()
    .withMessage('Phone number must be a string.'),
];

// ID validation
const patientIdValidation = param('id').isMongoId().withMessage('Invalid patient ID format.');

// Exported Validators
export const validateCreatePatient = [...patientFields, ...emergencyContactFields];

export const validateUpdatePatient = [
  patientIdValidation,
  ...patientFields.map((field) => field.optional()),
  ...emergencyContactFields.map((field) => field.optional()),
];

export const validateGetPatientById = [patientIdValidation];

export const validateDeletePatient = [patientIdValidation];
