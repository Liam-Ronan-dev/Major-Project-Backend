import { Prescription } from '../models/Prescription.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Medication } from '../models/Medication.js';
import { Item } from '../models/Item.js';

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

export const verifyOwnership = (modelType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      const models = {
        Prescription,
        Patient,
        Appointment,
        Medication,
        Item,
      };

      const model = models[modelType];
      if (!model) {
        return res.status(400).json({ message: 'Invalid model type' });
      }

      const record = await model.findById(id);
      if (!record) {
        return res.status(404).json({ message: `${modelType} not found` });
      }

      // Doctor can access prescriptions, patients, appointments they created
      if (req.user.role === 'doctor') {
        if (
          ['Prescription', 'Patient', 'Appointment'].includes(modelType) &&
          record.doctorId?.toString() !== req.user.id
        ) {
          return res
            .status(403)
            .json({ message: `Unauthorized: You do not own this ${modelType}` });
        }
      }

      // Pharmacist can access prescriptions/items assigned to them
      if (req.user.role === 'pharmacist') {
        if (modelType === 'Prescription' && record.pharmacistId?.toString() !== req.user.id) {
          return res
            .status(403)
            .json({ message: 'Unauthorized: You are not assigned to this prescription' });
        }

        if (modelType === 'Item') {
          // Load related prescription to verify pharmacist assignment
          const prescription = await Prescription.findById(record.prescriptionId);
          if (!prescription || prescription.pharmacistId.toString() !== req.user.id) {
            return res
              .status(403)
              .json({ message: 'Unauthorized: You are not assigned to this prescription item' });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      res.status(500).json({ message: 'Ownership verification failed' });
    }
  };
};
