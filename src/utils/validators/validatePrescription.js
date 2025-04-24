import { body, param } from 'express-validator';

// Reusable validation for items in a prescription
const itemValidations = [
  body('items').isArray({ min: 1 }).withMessage('Prescription must have at least one item.'),

  body('items.*.medicationId')
    .notEmpty()
    .withMessage('Each item must have a medication ID.')
    .bail()
    .isMongoId()
    .withMessage('Invalid medication ID.'),

  body('items.*.specificInstructions')
    .notEmpty()
    .withMessage('Specific instructions required.')
    .bail()
    .isString()
    .withMessage('Instructions must be a string.'),

  body('items.*.dosage')
    .notEmpty()
    .withMessage('Dosage is required.')
    .bail()
    .isString()
    .withMessage('Dosage must be a string.'),

  body('items.*.amount')
    .notEmpty()
    .withMessage('Amount is required.')
    .bail()
    .isString()
    .withMessage('Amount must be a string.'),

  body('items.*.repeats')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Repeats must be a non-negative integer.'),

  body('items.*.pharmacistNote')
    .optional()
    .isString()
    .withMessage('Pharmacist note must be a string if provided.'),
];

// Prescription main fields
const prescriptionFields = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required.')
    .bail()
    .isMongoId()
    .withMessage('Invalid patient ID format.'),

  body('pharmacistId')
    .notEmpty()
    .withMessage('Pharmacist ID is required.')
    .bail()
    .isMongoId()
    .withMessage('Invalid pharmacist ID format.'),

  body('notes').optional().isString().withMessage('Notes must be a string.').trim().escape(),
];

// ID validation
const prescriptionIdValidation = param('id')
  .isMongoId()
  .withMessage('Prescription ID must be a valid Mongo ID.');

export const validatePatchPrescription = [
  prescriptionIdValidation,
  body('status')
    .optional()
    .isIn(['Assigned', 'Pending', 'Processed', 'Completed', 'Cancelled'])
    .withMessage('Invalid status.'),

  body('notes').optional().isString().withMessage('Notes must be a string.').trim().escape(),

  body('itemNotes').optional().isArray().withMessage('Item notes must be an array.'),

  body('itemNotes.*.itemId')
    .notEmpty()
    .withMessage('Each item note must include itemId.')
    .bail()
    .isMongoId()
    .withMessage('Invalid item ID.'),

  body('itemNotes.*.pharmacistNote')
    .optional()
    .notEmpty()
    .withMessage('Pharmacist note must not be empty.')
    .isString()
    .withMessage('Pharmacist note must be a string.'),
];

export const validateCreatePrescription = [...prescriptionFields, ...itemValidations];

export const validateUpdatePrescription = [
  prescriptionIdValidation,
  ...prescriptionFields.map((field) => field.optional()),
  ...itemValidations.map((field) => field.optional()),
];

export const validateGetPrescriptionById = [prescriptionIdValidation];

export const validateDeletePrescription = [prescriptionIdValidation];
