import { Prescription } from '../models/Prescription.js';
import { Item } from '../models/Item.js';
import { Patient } from '../models/Patient.js';
import { Medication } from '../models/Medication.js';
import { io, connectedUsers } from '../index.js';

// Create Prescription - doctor
export const createPrescription = async (req, res) => {
  try {
    const { patientId, pharmacistId, notes, items } = req.body;

    if (!patientId || !pharmacistId || !items?.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure patient belongs to the doctor
    const patient = await Patient.findOne({ _id: patientId, doctorId: req.user.id });
    if (!patient) {
      return res.status(403).json({ message: 'You can only prescribe for your own patients' });
    }

    const prescription = await Prescription.create({
      doctorId: req.user.id,
      patientId,
      pharmacistId,
      notes,
    });

    // Create items
    const itemIds = await Promise.all(
      items.map(async (item) => {
        const { medicationId, dosage, amount, specificInstructions, repeats, pharmacistNote } =
          item;

        const medication = await Medication.findById(medicationId);
        if (!medication) throw new Error(`Medication not found: ${medicationId}`);

        const newItem = await Item.create({
          prescriptionId: prescription._id,
          medicationId,
          dosage,
          amount,
          specificInstructions,
          pharmacistNote,
          repeats: repeats ?? 0,
        });

        return newItem._id;
      })
    );

    prescription.items = itemIds;
    await prescription.save();

    // Pushing to the patients model
    await Patient.findByIdAndUpdate(patientId, {
      $push: { prescriptions: prescription._id },
    });

    // Notify pharmacist
    const pharmacistSocketId = connectedUsers.get(pharmacistId);
    if (pharmacistSocketId) {
      io.to(pharmacistSocketId).emit('new-prescription', {
        prescriptionId: prescription._id,
        message: `A new prescription has been assigned to you.`,
        patient: `${patient.firstName} ${patient.lastName}`,
        createdAt: prescription.createdAt,
      });
    }

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
    const { patientId, pharmacistId, notes, items } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (prescription.status !== 'Assigned') {
      return res.status(403).json({
        message: `Cannot update prescription — status is '${prescription.status}'`,
      });
    }

    const patient = await Patient.findOne({ _id: patientId, doctorId: req.user.id });
    if (!patient) {
      return res.status(403).json({
        message: 'You can only prescribe for your own patients',
      });
    }

    prescription.patientId = patientId;
    prescription.pharmacistId = pharmacistId;
    prescription.notes = notes;

    // Delete old items
    await Item.deleteMany({ prescriptionId: prescription._id });

    // Create new items
    const itemIds = await Promise.all(
      items.map(async (item) => {
        const { medicationId, dosage, amount, specificInstructions, pharmacistNote, repeats } =
          item;

        const medication = await Medication.findById(medicationId);
        if (!medication) throw new Error(`Medication not found: ${medicationId}`);

        const newItem = await Item.create({
          prescriptionId: prescription._id,
          medicationId,
          dosage,
          amount,
          specificInstructions,
          pharmacistNote, // optional
          repeats: repeats ?? 0,
        });

        return newItem._id;
      })
    );

    prescription.items = itemIds;
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

    // Find the prescription first
    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Prevent deletion if status is not "Assigned"
    if (prescription.status !== 'Assigned') {
      return res.status(403).json({
        message: `Cannot delete prescription — status is '${prescription.status}'`,
      });
    }

    // Delete all related items
    await Item.deleteMany({ prescriptionId: id });

    // Now delete the prescription
    await prescription.deleteOne();

    res.status(200).json({ message: 'Prescription and related items deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: 'Failed to delete prescription' });
  }
};

// Get All Prescriptions (Doctors & Pharmacists)
export const getAllPrescriptions = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    const filter = role === 'doctor' ? { doctorId: userId } : { pharmacistId: userId };

    const prescriptions = await Prescription.find(filter)
      .populate('patientId', 'firstName lastName dateOfBirth')
      .populate('pharmacistId', 'email')
      .populate('doctorId', 'email')
      .populate({
        path: 'items',
        select: 'medicationId dosage amount specificInstructions pharmacistNote repeats',
        populate: {
          path: 'medicationId',
          select: 'name activeSubstance',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ count: prescriptions.length, data: prescriptions });
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
};

// Get Prescription by ID (Doctors & Assigned Pharmacists Only)
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;
    const userId = req.user.id;

    const prescription = await Prescription.findById(id)
      .populate('patientId', 'firstName lastName dateOfBirth')
      .populate('pharmacistId', 'email')
      .populate('doctorId', 'email')
      .populate({
        path: 'items',
        select: 'medicationId dosage amount specificInstructions pharmacistNote repeats',
        populate: {
          path: 'medicationId',
          select: 'name activeSubstance',
        },
      });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Authorization check
    if (
      (role === 'doctor' && prescription.doctorId._id.toString() !== userId) ||
      (role === 'pharmacist' && prescription.pharmacistId._id.toString() !== userId)
    ) {
      return res.status(403).json({ message: 'You are not authorized to view this prescription' });
    }

    res.status(200).json({ data: prescription });
  } catch (err) {
    console.error('Error fetching prescription:', err);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};

// Update status & notes of Prescription - pharmacists
export const updatePrescriptionStatusAndNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, itemNotes } = req.body;

    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({ message: 'Only pharmacists can update prescriptions' });
    }

    const allowedStatuses = ['Pending', 'Processed', 'Completed', 'Cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Update status and notes if provided
    if (status) prescription.status = status;
    if (notes) prescription.notes = notes;

    await prescription.save();

    // Update pharmacist notes on individual items
    if (Array.isArray(itemNotes)) {
      await Promise.all(
        itemNotes.map(async ({ itemId, pharmacistNote }) => {
          const item = await Item.findOne({
            _id: itemId,
            prescriptionId: prescription._id,
          });

          if (item && pharmacistNote !== undefined) {
            item.pharmacistNote = pharmacistNote;
            await item.save();
          }
        })
      );
    }

    // Notify doctor via socket
    const doctorSocketId = connectedUsers.get(prescription.doctorId.toString());
    if (doctorSocketId) {
      const patient = await Patient.findById(prescription.patientId);

      io.to(doctorSocketId).emit('prescription-updated', {
        prescriptionId: prescription._id,
        status: prescription.status,
        notes: prescription.notes,
        updatedAt: prescription.updatedAt,
        message: 'Prescription updated by pharmacist.',
        patient: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient',
      });
    }

    res.status(200).json({
      message: 'Prescription updated successfully',
      data: {
        id: prescription._id,
        status: prescription.status,
        notes: prescription.notes,
      },
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Failed to update prescription' });
  }
};
