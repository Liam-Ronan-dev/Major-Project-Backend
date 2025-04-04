import { Medication } from '../models/Medication.js';

// Get All medications (Doctor & pharmacist)
export const getAllMedications = async (req, res) => {
  try {
    const medications = await Medication.find();

    if (!medications.length) {
      return res.status(404).json({ message: 'No medications found' });
    }

    res.status(200).json({ count: medications.length, data: medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Failed to fetch medications' });
  }
};

// Get single medication by ID
export const getMedicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const medication = await Medication.findById(id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    res.status(200).json({ data: medication });
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ message: 'Failed to fetch medication' });
  }
};

// Search medications by name
export const searchMedications = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Search term must be at least 2 characters' });
    }

    const medications = await Medication.find({
      name: { $regex: name, $options: 'i' },
    }).limit(20);

    if (!medications.length) {
      return res.status(404).json({ message: 'No matching medications found' });
    }

    res.status(200).json({ count: medications.length, data: medications });
  } catch (error) {
    console.error('Error searching medications:', error);
    res.status(500).json({ message: 'Failed to search medications' });
  }
};
