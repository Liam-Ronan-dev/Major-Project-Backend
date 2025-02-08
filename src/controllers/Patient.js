import { Patient } from '../models/Patient.js';

// Create new Patient function - for Doctor role
export const createPatient = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth } = req.body;

    const patient = await Patient.create({
      firstName,
      lastName,
      dateOfBirth,
      doctorId: req.user.id, // Assign doctor automatically
    });

    res.status(201).json({
      data: patient,
      message: `${firstName} successfully created`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating patient', error: error.message });
  }
};

// Update patient details - for doctor role
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth } = req.body;

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Only update fields that are provided
    patient.firstName = firstName || patient.firstName;
    patient.lastName = lastName || patient.lastName;
    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;

    await patient.save();

    res.status(200).json({
      data: patient,
      message: 'Patient updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating patient',
      error: error.message,
    });
  }
};

// Get all patients (Doctors & Pharmacists)
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate({
      path: 'prescriptions',
      model: 'Prescription',
      select: 'diagnosis',
    });

    if (!patients) {
      return res
        .status(404)
        .json({ message: 'Currently, no archived patients' });
    }

    res.status(200).json({
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching patients',
      error: error.message,
    });
  }
};

// Get a single patient by ID (Doctors & Pharmacists)
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).populate({
      path: 'prescriptions',
      model: 'Prescription',
      select: 'diagnosis',
    });

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.status(200).json({
      data: patient,
      message: `Successfully retrieved the ${patient.firstName}`,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching patient',
      error: error.message,
    });
  }
};

// Delete a patient (Doctor Only)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOneAndDelete({
      _id: id,
      doctorId: req.user.id, // Ensure the doctor deleting is the one who created the patient
    });

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.status(200).json({
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting patient',
      error: error.message,
    });
  }
};
