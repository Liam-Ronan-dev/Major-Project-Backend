import express from 'express';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles } from '../middleware/auth.js';
import {
  getAllMedications,
  getMedicationById,
  searchMedications,
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

// Search medications by name
router.get(
  '/medications/search',
  ensureAuthenticated,
  authorizeRoles('pharmacist', 'doctor'),
  searchMedications
);

export default router;
