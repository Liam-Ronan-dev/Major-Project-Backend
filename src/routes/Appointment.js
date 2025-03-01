import express from 'express';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles } from '../middleware/auth.js';
import { verifyOwnership } from '../middleware/auth.js';
import {
  createAppointment,
  deleteAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
} from '../controllers/Appointment.js';

const router = express.Router();

// Get All Appointments
router.get(
  '/appointments',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  getAllAppointments
);

// Get Single Appointment
router.get(
  '/appointment/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  getAppointmentById
);

// Create an Appointment
router.post(
  '/appointments',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  createAppointment
);

// Update an Appointment
router.put(
  '/appointment/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Appointment'),
  updateAppointment
);

// Delete an Appointment
router.delete(
  '/appointment/:id',
  ensureAuthenticated,
  authorizeRoles('doctor'),
  verifyOwnership('Appointment'),
  deleteAppointment
);

export default router;
