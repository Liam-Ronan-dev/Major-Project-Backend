import { Medication } from '../models/Medication.js';

// Create a medication (Pharmacist Only)
export const createMedication = async (req, res) => {
  try {
    const { name, form, stock, supplier, price } = req.body;

    if (!name || !form || !stock || !supplier || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newMedication = await Medication.create({
      name,
      form,
      stock,
      supplier,
      price,
      pharmacistId: req.user.id,
    });

    res.status(201).json({
      message: 'Medication created successfully',
      medication: newMedication,
    });
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({ message: 'Failed to create medication' });
  }
};

// Get All medications (Doctor & pharmacist)
export const getAllMedications = async (req, res) => {
  try {
    const medications = await Medication.find().populate('pharmacistId', 'email');

    if (!medications.length) {
      return res.status(404).json({ message: 'No medications found' });
    }

    res.status(200).json({ count: medications.length, data: medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Failed to fetch medications' });
  }
};

// Single medication By id
export const getMedicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const medication = await Medication.findById(id).populate('pharmacistId', 'email');

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.status(200).json({ data: medication });
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ message: 'Failed to fetch medication' });
  }
};

// Update a medication (Pharmacist only)
export const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMedication = await Medication.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedMedication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.status(200).json({ message: 'Medication updated successfully', data: updatedMedication });
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ message: 'Failed to update medication' });
  }
};

// Delete a medication (Pharmacists Only)
export const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;

    const medication = await Medication.findByIdAndDelete({
      _id: id,
      pharmacistId: req.user.id, // Only delete if the pharmacist owns it
    });

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.status(200).json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: 'Failed to delete medication' });
  }
};
