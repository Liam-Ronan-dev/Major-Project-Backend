import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const PrescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    medications: [
      {
        medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication' },
        name: { type: String, required: true },
        form: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        notes: { type: String },
      },
    ],
    diagnosis: {
      type: String,
      required: true,
      set: encryptData, // ✅ Encrypt for security
      get: decryptData,
    },
    notes: {
      type: String,
      set: encryptData,
      get: decryptData,
    },
    pharmacyName: {
      type: String,
      required: true,
    },
    repeats: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true } // Manage `createdAt` & `updatedAt`
);

PrescriptionSchema.set('toJSON', { getters: true });
PrescriptionSchema.set('toObject', { getters: true });

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
