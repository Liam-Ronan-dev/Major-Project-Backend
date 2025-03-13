import express from 'express';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles } from '../middleware/auth.js';
import { verifyOwnership } from '../middleware/auth.js';
import {
  createPatient,
  deletePatient,
  getAllPatients,
  getPatientById,
  updatePatient,
} from '../controllers/Patient.js';
import {
  validateCreatePatient,
  validateDeletePatient,
  validateGetPatientById,
  validateUpdatePatient,
} from '../utils/validators/validatePatient.js';
import { handleInputErrors } from '../middleware/errors.js';

const router = express.Router();

// Get all patients
router.get(
  '/patients',
  ensureAuthenticated,
  authorizeRoles('doctor', 'pharmacist'),
  getAllPatients
);

// Get single Patient
router.get(
  '/patient/:id',
  ensureAuthenticated,
  authorizeRoles('doctor', 'pharmacist'),
  verifyOwnership('Patient'),
  validateGetPatientById,
  handleInputErrors,
  getPatientById
);

// Create new Patient - Doctor
router.post(
  '/patients',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  validateCreatePatient,
  handleInputErrors,
  createPatient
);

// Update a Patient - Doctor
router.put(
  '/patient/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Patient'),
  validateUpdatePatient,
  handleInputErrors,
  updatePatient
);

// Delete a Patient - Doctor
router.delete(
  '/patient/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Patient'),
  validateDeletePatient,
  handleInputErrors,
  deletePatient
);

export default router;
