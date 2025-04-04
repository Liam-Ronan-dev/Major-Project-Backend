import express from 'express';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles, verifyOwnership } from '../middleware/auth.js';

import {
  createPrescription,
  deletePrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  updatePrescriptionStatusAndNotes,
} from '../controllers/prescription.js';

import {
  validateCreatePrescription,
  validateDeletePrescription,
  validateGetPrescriptionById,
  validatePatchPrescription,
  validateUpdatePrescription,
} from '../utils/validators/validatePrescription.js';

import { handleInputErrors } from '../middleware/errors.js';

const router = express.Router();

// Doctor: Create prescription
router.post(
  '/prescriptions',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  validateCreatePrescription,
  handleInputErrors,
  createPrescription
);

// Doctor: Update their own prescription
router.put(
  '/prescription/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Prescription'),
  validateUpdatePrescription,
  handleInputErrors,
  updatePrescription
);

// Doctor: Delete their own prescription
router.delete(
  '/prescription/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Prescription'),
  validateDeletePrescription,
  handleInputErrors,
  deletePrescription
);

// Doctor/Pharmacist: View all accessible prescriptions
router.get(
  '/prescriptions',
  ensureAuthenticated,
  authorizeRoles('doctor', 'pharmacist'),
  getAllPrescriptions
);

// Doctor/Pharmacist: View a single prescription
router.get(
  '/prescription/:id',
  ensureAuthenticated,
  authorizeRoles('doctor', 'pharmacist'),
  verifyOwnership('Prescription'),
  validateGetPrescriptionById,
  handleInputErrors,
  getPrescriptionById
);

// Pharmacist: Update prescription status and notes
router.patch(
  '/prescription/:id/status',
  ensureAuthenticated,
  authorizeRoles('pharmacist'),
  verifyOwnership('Prescription'),
  validatePatchPrescription,
  handleInputErrors,
  updatePrescriptionStatusAndNotes
);

export default router;
