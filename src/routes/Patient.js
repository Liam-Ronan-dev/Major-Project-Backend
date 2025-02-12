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
  getPatientById
);

// Create new Patient - Doctor
router.post(
  '/patients',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  createPatient
);

// Update a Patient - Doctor
router.put(
  '/patient/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Patient'),
  updatePatient
);

// Delete a Patient - Doctor
router.delete(
  '/patient/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Patient'),
  deletePatient
);

export default router;
