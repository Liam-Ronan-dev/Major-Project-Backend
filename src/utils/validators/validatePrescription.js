import { body, param } from 'express-validator';

// Reusable validation for items in a prescription
const itemValidations = [
  body('items').isArray({ min: 1 }).withMessage('Prescription must have at least one item.'),

  body('items.*.medications')
    .isArray({ min: 1 })
    .withMessage('Each item must have at least one medication.')
    .bail()
    .custom((medications) => {
      if (!medications.every((id) => /^[a-f\d]{24}$/i.test(id))) {
        throw new Error('Each medication must be a valid Mongo ID.');
      }
      return true;
    }),

  body('items.*.specificInstructions')
    .notEmpty()
    .withMessage('Specific instructions required.')
    .bail()
    .isString()
    .withMessage('Instructions must be a string.'),

  body('items.*.dosages')
    .isArray({ min: 1 })
    .withMessage('Each item must have at least one dosage.'),

  body('items.*.dosages.*.medicationId')
    .notEmpty()
    .withMessage('Medication ID is required for dosage.')
    .bail()
    .isMongoId()
    .withMessage('Invalid medication ID format.'),

  body('items.*.dosages.*.amount')
    .notEmpty()
    .withMessage('Dosage amount is required.')
    .bail()
    .isString()
    .withMessage('Dosage amount must be a string.'),

  body('items.*.dosages.*.frequency')
    .notEmpty()
    .withMessage('Dosage frequency is required.')
    .bail()
    .isString()
    .withMessage('Frequency must be a string.'),

  body('items.*.dosages.*.duration')
    .notEmpty()
    .withMessage('Dosage duration is required.')
    .bail()
    .isString()
    .withMessage('Duration must be a string.'),

  body('items.*.dosages.*.notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string if provided.'),
];

// Prescription main fields
const prescriptionFields = [
  body('patientId').isMongoId().withMessage('Invalid patient ID format.'),
  body('pharmacistId').isMongoId().withMessage('Invalid pharmacist ID format.'),
  body('pharmacyName')
    .notEmpty()
    .withMessage('Pharmacy name is required.')
    .bail()
    .isString()
    .withMessage('Pharmacy name must be a string.'),
  body('generalInstructions')
    .notEmpty()
    .withMessage('General instructions are required.')
    .bail()
    .isString()
    .withMessage('General instructions must be a string.'),
  body('repeats').isInt({ min: 0 }).withMessage('Repeats must be a positive integer.'),
  body('status')
    .optional()
    .isIn(['Pending', 'Processed', 'Completed', 'Cancelled'])
    .withMessage('Invalid status.'),
  body('notes').optional().trim().escape(),
];

// ID validation
const prescriptionIdValidation = param('id')
  .isMongoId()
  .withMessage('Prescription ID must be a valid Mongo ID.');

// Prescription Validators
export const validateCreatePrescription = [...prescriptionFields, ...itemValidations];

export const validateUpdatePrescription = [
  prescriptionIdValidation,
  ...prescriptionFields.map((field) => field.optional()),
  ...itemValidations.map((field) => field.optional()),
];

export const validatePatchPrescription = [
  prescriptionIdValidation,
  body('status')
    .optional()
    .isIn(['Pending', 'Processed', 'Completed', 'Cancelled'])
    .withMessage('Invalid status.'),
  body('notes').optional().trim().escape(),
];

export const validateGetPrescriptionById = [prescriptionIdValidation];

export const validateDeletePrescription = [prescriptionIdValidation];
