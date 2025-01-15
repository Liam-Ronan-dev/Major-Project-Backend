import { Prescription } from '../models/Prescription.js';

export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();

    if (!prescriptions) {
      return res
        .status(404)
        .json({ message: 'Currently, there is no Prescriptions' });
    }

    res.status(200).json({
      data: prescriptions,
      message: 'successfully retrieved all Prescriptions',
    });
  } catch (error) {
    console.error(`Error fetching Prescriptions: ${error}`);
  }
};

export const getSinglePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the prescription by the custom prescriptionId field
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        message: `There is no Prescription with id: ${id}`,
      });
    }

    res.status(200).json({
      data: prescription,
      message: `Successfully retrieved Prescription: ${id}`,
    });
  } catch (error) {
    console.error(`Error fetching Prescription: ${error}`);
    res.status(500).json({ message: 'Failed to fetch Prescription' });
  }
};

export const createPrescription = async (req, res) => {
  try {
    // Destructure required fields from request body
    const {
      doctorId,
      doctorName,
      patientId,
      patientName,
      patientAge,
      patientGender,
      medications,
      diagnosis,
      notes,
      pharmacyId,
      encryptedData,
    } = req.body;

    // Validate required fields
    if (
      !doctorId ||
      !doctorName ||
      !patientId ||
      !patientName ||
      !patientAge ||
      !patientGender ||
      !medications ||
      !diagnosis ||
      !pharmacyId
    ) {
      return res.status(400).json({
        message:
          'Missing required fields. Please provide all necessary details.',
      });
    }

    // Create a new prescription
    const newPrescription = await Prescription.create({
      doctorId,
      doctorName,
      patientId,
      patientName,
      patientAge,
      patientGender,
      medications,
      diagnosis,
      notes,
      pharmacyId,
      encryptedData, // Optional encrypted data field
    });

    // Respond with the created prescription
    res.status(201).json({
      message: 'Prescription successfully created',
      prescription: newPrescription,
    });
  } catch (error) {
    console.error(`Error creating Prescription: ${error}`);
    res.status(500).json({ message: 'Failed to create Prescription' });
  }
};
