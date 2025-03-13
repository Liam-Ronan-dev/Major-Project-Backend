import express from 'express';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles } from '../middleware/auth.js';
import { verifyOwnership } from '../middleware/auth.js';
import {
  createPrescription,
  deletePrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  updatePrescriptionStatus,
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

// Doctors can only create prescriptions
router.post(
  '/prescriptions',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  validateCreatePrescription,
  handleInputErrors,
  createPrescription
);

// Doctors can only update their own prescriptions
router.put(
  '/prescription/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Prescription'),
  validateUpdatePrescription,
  handleInputErrors,
  updatePrescription
);

// Doctors can only delete their own prescriptions
router.delete(
  '/prescription/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Prescription'),
  validateDeletePrescription,
  handleInputErrors,
  deletePrescription
);

// Doctors can only view their own prescriptions & Pharmacists can only view assigned ones
router.get(
  '/prescriptions',
  ensureAuthenticated,
  authorizeRoles('doctor', 'pharmacist'),
  getAllPrescriptions
);

// Doctors can only access their own prescriptions & Pharmacists can only access assigned ones
router.get(
  '/prescription/:id',
  ensureAuthenticated,
  authorizeRoles('doctor', 'pharmacist'),
  verifyOwnership('Prescription'),
  validateGetPrescriptionById,
  handleInputErrors,
  getPrescriptionById
);

router.patch(
  '/prescription/:id/status',
  ensureAuthenticated,
  authorizeRoles('pharmacist'),
  validatePatchPrescription,
  handleInputErrors,
  updatePrescriptionStatus
);

export default router;
