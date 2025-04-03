import { Patient } from '../models/Patient.js';

// Create new Patient (Doctor Only)
export const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
      medicalHistory,
      emergencyContact,
    } = req.body;

    const patient = await Patient.create({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
      medicalHistory,
      emergencyContact,
      doctorId: req.user.id,
    });

    res.status(201).json({
      data: patient,
      message: `${firstName} successfully created`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
};

// Update patient details (Doctor Only)
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPatient) return res.status(404).json({ message: 'Patient not found' });

    res.status(200).json({ data: updatedPatient, message: 'Patient updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    let patients;

    if (req.user.role === 'doctor') {
      // ✅ Fetch patients for the doctor
      patients = await Patient.find({ doctorId: req.user.id })
        .populate({
          path: 'prescriptions',
          model: 'Prescription',
          populate: [
            {
              path: 'items',
              model: 'Item',
              populate: [
                {
                  path: 'medications',
                  model: 'Medication',
                  select: 'name form',
                },
                {
                  path: 'dosages',
                  model: 'Dosage',
                  select: 'amount frequency duration notes',
                },
              ],
            },
            {
              path: 'pharmacistId',
              model: 'User',
              select: 'email',
            },
          ],
          select: 'diagnosis pharmacistId items',
        })
        .populate({
          path: 'appointments',
          model: 'Appointment',
          select: 'date status notes',
        })
        .populate({
          path: 'doctorId',
          model: 'User',
          select: 'email',
        });
    } else if (req.user.role === 'pharmacist') {
      // ✅ Fetch patients where the pharmacist is assigned to prescriptions
      patients = await Patient.find({
        prescriptions: { $exists: true, $not: { $size: 0 } },
      })
        .populate({
          path: 'prescriptions',
          model: 'Prescription',
          match: { pharmacistId: req.user.id },
          populate: [
            {
              path: 'items',
              model: 'Item',
              populate: [
                {
                  path: 'medications',
                  model: 'Medication',
                  select: 'name form',
                },
                {
                  path: 'dosages',
                  model: 'Dosage',
                  select: 'amount frequency duration notes',
                },
              ],
            },
            {
              path: 'pharmacistId',
              model: 'User',
              select: 'email',
            },
          ],
          select: 'diagnosis pharmacistId items',
        })
        .populate({
          path: 'appointments',
          model: 'Appointment',
          select: 'date status notes',
        })
        .populate({
          path: 'doctorId',
          model: 'User',
          select: 'email',
        });

      patients = patients.filter((p) => p.prescriptions && p.prescriptions.length > 0);
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!patients.length) {
      return res.status(400).json({ message: 'No patients found' });
    }

    res.status(200).json({
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
};

// Get a single patient by ID (Doctors & Pharmacists)
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id)
      .populate({
        path: 'prescriptions',
        model: 'Prescription',
        select: 'medications pharmacistId',
      })
      .populate({
        path: 'appointments',
        model: 'Appointment',
        select: 'date status notes',
      })
      .populate({
        path: 'doctorId',
        model: 'User',
        select: 'email',
      });

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    res.status(200).json({
      data: patient,
      message: `Successfully retrieved ${patient.firstName}`,
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
