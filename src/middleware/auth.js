import { Prescription } from '../models/Prescription.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Medication } from '../models/Medication.js';

// Role-based access control middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role.toLowerCase();
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
};

// Ownership middleware - To verify that the logged in user can only access their own created resources
/**
 *
 */
export const verifyOwnership = (modelType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params; // The resource being accessed

      let model;
      if (modelType === 'Prescription') model = Prescription;
      if (modelType === 'Patient') model = Patient;
      if (modelType === 'Medication') model = Medication;
      if (modelType === 'Appointment') model = Appointment;

      if (!model) {
        return res.status(400).json({ message: 'Invalid model type' });
      }

      // Fetch the record from the database
      const record = await model.findById(id);

      if (!record) {
        return res.status(404).json({ message: `${modelType} not found` });
      }

      console.log(`Ownership verification for ${modelType}:`, record);

      // Doctor Ownership Check (Patients, Appointments, Prescriptions)
      if (req.user.role === 'doctor') {
        if (
          ['Patient', 'Appointment', 'Prescription'].includes(modelType) &&
          record.doctorId?.toString() !== req.user.id
        ) {
          return res.status(403).json({
            message: `Unauthorized: You do not own this ${modelType}`,
          });
        }
      }

      // Pharmacist Ownership Check (Medications & Orders)
      if (req.user.role === 'pharmacist') {
        if (
          ['Medication', 'Order'].includes(modelType) &&
          record.pharmacistId?.toString() !== req.user.id
        ) {
          return res.status(403).json({
            message: `Unauthorized: You do not own this ${modelType}`,
          });
        }
      }

      next(); // Proceed to the controller
    } catch (error) {
      console.error(`Ownership verification error:`, error);
      res.status(500).json({ message: 'Failed to verify ownership' });
    }
  };
};
