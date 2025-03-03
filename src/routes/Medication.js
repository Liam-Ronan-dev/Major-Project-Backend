import express from 'express';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles } from '../middleware/auth.js';
import { verifyOwnership } from '../middleware/auth.js';
import {
  createMedication,
  deleteMedication,
  getAllMedications,
  getMedicationById,
  updateMedication,
} from '../controllers/Medication.js';

const router = express.Router();

// Get all medications (Doctors & Pharmacists)
router.get(
  '/medications',
  ensureAuthenticated,
  authorizeRoles('pharmacist', 'doctor'),
  getAllMedications
);

// Get medication by ID (Any doctor or pharmacist)
router.get(
  '/medication/:id',
  ensureAuthenticated,
  authorizeRoles('pharmacist', 'doctor'),
  getMedicationById
);

// Pharmacists can create medications
router.post('/medications', ensureAuthenticated, authorizeRoles('pharmacist'), createMedication);

// Pharmacists can update only their own medications
router.put(
  '/medication/:id',
  ensureAuthenticated,
  authorizeRoles('pharmacist'),
  verifyOwnership('Medication'),
  updateMedication
);

// Pharmacists can delete only their own medications
router.delete(
  '/medication/:id',
  ensureAuthenticated,
  authorizeRoles('pharmacist'),
  verifyOwnership('Medication'),
  deleteMedication
);

export default router;
