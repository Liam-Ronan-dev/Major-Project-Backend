import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const PrescriptionSchema = new mongoose.Schema({
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
      medicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medication', required: true },
      name: { type: String, required: true, set: encryptData, get: decryptData },
      form: { type: String, required: true, set: encryptData, get: decryptData },
      dosage: { type: String, required: true, set: encryptData, get: decryptData },
      frequency: { type: String, required: true, set: encryptData, get: decryptData },
      duration: { type: String, required: true, set: encryptData, get: decryptData },
      notes: { type: String, set: encryptData, get: decryptData },
    },
  ],
  diagnosis: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  pharmacyName: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// decryption when returning JSON
PrescriptionSchema.set('toJSON', { getters: true });
PrescriptionSchema.set('toObject', { getters: true });

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
