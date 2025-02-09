import { Prescription } from '../models/Prescription.js';
import { Patient } from '../models/Patient.js';

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

export const verifyOwnership = (modelType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      console.log(`Verifying ownership for ${modelType} with ID:`, id);

      if (!id) {
        return res.status(400).json({ message: `${modelType} ID is required` });
      }

      let model;
      if (modelType === 'Prescription') {
        model = Prescription;
      } else if (modelType === 'Patient') {
        model = Patient;
      } else {
        return res.status(500).json({ message: 'Invalid model type' });
      }

      // Ensure prescriptions are populated if checking a patient
      const record =
        modelType === 'Patient'
          ? await model.findById(id).populate({
              path: 'prescriptions',
              model: 'Prescription',
              select: 'pharmacistId',
            })
          : await model.findById(id);

      if (!record) {
        console.log(`${modelType} not found`);
        return res.status(404).json({ message: `${modelType} not found` });
      }

      console.log(`Found ${modelType}:`, record);

      if (
        req.user.role === 'doctor' &&
        record.doctorId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: `Unauthorized - You do not own this ${modelType}`,
        });
      }

      if (req.user.role === 'pharmacist') {
        if (
          modelType === 'Prescription' &&
          record.pharmacistId.toString() !== req.user.id
        ) {
          return res.status(403).json({
            message: `Unauthorized - This ${modelType} is not assigned to you`,
          });
        }
        if (
          modelType === 'Patient' &&
          !record.prescriptions.some(
            (p) => p.pharmacistId.toString() === req.user.id
          )
        ) {
          return res.status(403).json({
            message: `Unauthorized - You do not have access to this ${modelType}`,
          });
        }
      }

      console.log(
        `Ownership verified for ${modelType}, proceeding to controller`
      );
      next();
    } catch (error) {
      console.error(`Ownership verification error for ${modelType}:`, error);
      res
        .status(500)
        .json({ message: `Failed to verify ${modelType} ownership` });
    }
  };
};
