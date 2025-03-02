import { Prescription } from '../models/Prescription.js';
import { Patient } from '../models/Patient.js';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

// Create Prescription (Doctors only)
export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, diagnosis, pharmacistId, notes, pharmacyName } = req.body;

    if (!patientId || !medications || !diagnosis || !pharmacistId || !notes || !pharmacyName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: req.user.id,
    });

    if (!patient) {
      return res.status(403).json({
        message: 'You can only create prescriptions for your own patients.',
      });
    }

    // Generate a unique prescriptionId if it's not provided
    const prescriptionId = uuidv4(); // Generates a unique ID

    const newPrescription = await Prescription.create({
      prescriptionId,
      patientId,
      doctorId: req.user.id,
      medications,
      diagnosis,
      pharmacistId,
      notes,
      pharmacyName,
      status: 'Pending',
    });

    patient.prescriptions.push(newPrescription._id);
    await patient.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      data: newPrescription,
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'failed to create prescription' });
  }
};

// Update Prescription (Doctors Only)
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const prescription = await Prescription.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found or unauthorized' });
    }

    res.status(200).json({ message: 'Prescription updated', data: prescription });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Failed to update prescription' });
  }
};

// Delete Prescription (Doctors Only)
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found or unauthorized' });
    }

    await Patient.updateOne({ _id: prescription.patientId }, { $pull: { prescriptions: id } });

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
};

// Get All Prescriptions (Doctors & Pharmacists)
export const getAllPrescriptions = async (req, res) => {
  try {
    let prescriptions;

    if (req.user.role === 'doctor') {
      prescriptions = await Prescription.find({
        doctorId: req.user.id,
      }).populate({
        path: 'patientId',
        select: 'firstName lastName',
      });
    } else if (req.user.role === 'pharmacist') {
      prescriptions = await Prescription.find({
        pharmacistId: req.user.id,
      }).populate({
        path: 'patientId',
        select: 'firstName lastName',
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ data: prescriptions });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
};

// Get Prescription by ID (Doctors & Assigned Pharmacists Only)
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Fetching prescription with ID:', id); // 🔍 Log Prescription ID

    const prescription = await Prescription.findById(id).populate({
      path: 'patientId',
      select: 'firstName lastName',
    });

    if (!prescription) {
      console.log('Prescription not found in DB'); // 🔍 Log missing prescription
      return res.status(404).json({ message: 'Prescription not found' });
    }

    console.log('Fetched prescription:', prescription); // 🔍 Log fetched prescription

    res.status(200).json({ data: prescription });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};
