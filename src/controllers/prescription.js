import { Prescription } from '../models/Prescription.js';
import { Item } from '../models/Item.js';
import { Dosage } from '../models/Dosage.js';
import { Patient } from '../models/Patient.js';
import { Medication } from '../models/Medication.js';

// Create Prescription - doctor
export const createPrescription = async (req, res) => {
  try {
    const { patientId, pharmacistId, pharmacyName, generalInstructions, repeats, notes, items } =
      req.body;

    if (!patientId || !pharmacistId || !pharmacyName || !repeats || !items.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure patient belongs to doctor
    const patient = await Patient.findOne({ _id: patientId, doctorId: req.user.id });
    if (!patient) {
      return res.status(403).json({ message: 'You can only prescribe for your own patients' });
    }

    // Create the Prescription
    const prescription = await Prescription.create({
      doctorId: req.user.id,
      patientId,
      pharmacistId,
      pharmacyName,
      generalInstructions,
      repeats,
      notes,
    });

    await Patient.findByIdAndUpdate(patientId, {
      $push: { prescriptions: prescription._id },
    });

    // Loop over each item in the items array
    const itemPromises = items.map(async (item) => {
      const { medications, specificInstructions, dosages } = item;

      // Create the Item
      const newItem = await Item.create({
        prescriptionId: prescription._id,
        medications,
        specificInstructions,
      });

      // Process Each Dosage for the Item
      const dosagePromises = dosages.map(async (dosage) => {
        const { medicationId, amount, frequency, duration, notes } = dosage;

        // Ensure medication exists
        const medication = await Medication.findById(medicationId);
        if (!medication) throw new Error(`Medication with ID ${medicationId} not found`);

        return Dosage.create({
          itemId: newItem._id,
          medicationId,
          amount,
          frequency,
          duration,
          notes,
        });
      });

      // Attach Dosages to the Item
      const createdDosages = await Promise.all(dosagePromises);
      newItem.dosages = createdDosages.map((dosage) => dosage._id);
      await newItem.save();

      return newItem._id;
    });

    // Attach Items to the Prescription
    prescription.items = await Promise.all(itemPromises);
    await prescription.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      data: prescription,
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
};

// Update Prescription (Doctors only)
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, pharmacistId, pharmacyName, generalInstructions, repeats, notes, items } =
      req.body;

    // ✅ Ensure prescription exists
    let prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // ✅ Update prescription fields
    prescription.patientId = patientId;
    prescription.pharmacistId = pharmacistId;
    prescription.pharmacyName = pharmacyName;
    prescription.generalInstructions = generalInstructions;
    prescription.repeats = repeats;
    prescription.notes = notes;

    // ✅ Process `items` (Update or Create new)
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        let existingItem = await Item.findOne({
          prescriptionId: id,
          medications: item.medications,
          specificInstructions: item.specificInstructions,
        });

        if (!existingItem) {
          // ✅ Create new Item if it doesn't exist
          existingItem = await Item.create({
            prescriptionId: id,
            medications: item.medications,
            specificInstructions: item.specificInstructions,
          });
        }

        // ✅ Process Dosages for this Item
        const updatedDosages = await Promise.all(
          item.dosages.map(async (dosage) => {
            let existingDosage = await Dosage.findOne({
              itemId: existingItem._id,
              medicationId: dosage.medicationId,
              amount: dosage.amount,
              frequency: dosage.frequency,
              duration: dosage.duration,
              notes: dosage.notes,
            });

            if (!existingDosage) {
              // ✅ Create new Dosage if it doesn't exist
              existingDosage = await Dosage.create({
                itemId: existingItem._id,
                medicationId: dosage.medicationId,
                amount: dosage.amount,
                frequency: dosage.frequency,
                duration: dosage.duration,
                notes: dosage.notes,
              });
            }
            return existingDosage._id; // Return Dosage ID
          })
        );

        existingItem.dosages = updatedDosages;
        await existingItem.save();

        return existingItem._id; // Return Item ID
      })
    );

    // ✅ Update prescription with the new `items` references
    prescription.items = updatedItems;
    await prescription.save();

    res.status(200).json({
      message: 'Prescription updated successfully',
      data: prescription,
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Failed to update prescription' });
  }
};

// Delete Prescription (Doctors only)
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete prescription
    const prescription = await Prescription.findOneAndDelete({
      _id: id,
      doctorId: req.user.id,
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found or unauthorized' });
    }

    // Delete associated items & dosages
    const items = await Item.find({ prescriptionId: id });
    const itemIds = items.map((item) => item._id);

    await Item.deleteMany({ prescriptionId: id });
    await Dosage.deleteMany({ itemId: { $in: itemIds } });

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
      prescriptions = await Prescription.find({ doctorId: req.user.id })
        .populate('items')
        .populate({
          path: 'items',
          populate: {
            path: 'medications',
            select: 'name form',
          },
        })
        .populate({
          path: 'items',
          populate: {
            path: 'dosages',
            select: 'amount frequency duration notes',
          },
        })
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'email')
        .populate('pharmacistId', 'email');
    } else if (req.user.role === 'pharmacist') {
      prescriptions = await Prescription.find({ pharmacistId: req.user.id })
        .populate('items')
        .populate({
          path: 'items',
          populate: {
            path: 'medications',
            select: 'name form',
          },
        })
        .populate({
          path: 'items',
          populate: {
            path: 'dosages',
            select: 'amount frequency duration notes',
          },
        })
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'email')
        .populate('pharmacistId', 'email');
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

    const prescription = await Prescription.findById(id)
      .populate('items')
      .populate({
        path: 'items',
        populate: {
          path: 'medications',
          select: 'name form',
        },
      })
      .populate({
        path: 'items',
        populate: {
          path: 'dosages',
          select: 'amount frequency duration notes',
        },
      })
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'email')
      .populate('pharmacistId', 'email');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ data: prescription });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};

// Update status & notes of Prescription - pharmacists
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, status } = req.body;

    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({ message: 'Unauthorized: Only pharmacists can update status' });
    }

    // Validate status update
    const allowedStatuses = ['Pending', 'Processed', 'Completed', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    // Find the prescription & ensure the pharmacist is assigned
    const prescription = await Prescription.findOne({
      _id: id,
      pharmacistId: req.user.id,
    });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found or unauthorized' });
    }

    // Update only `notes` and `status`
    if (notes) prescription.notes = notes;
    if (status) prescription.status = status;

    await prescription.save();

    res.status(200).json({
      message: 'Prescription updated successfully',
      data: {
        id: prescription._id,
        status: prescription.status,
        notes: prescription.notes,
      },
    });
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({ message: 'Failed to update prescription status' });
  }
};
