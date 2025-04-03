import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
  },
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
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  repeats: {
    type: Number,
    required: true,
  },
  generalInstructions: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  notes: {
    type: String,
    set: encryptData,
    get: decryptData,
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

// ✅ Auto-generate `prescriptionId` if missing
PrescriptionSchema.pre('save', function (next) {
  if (!this.prescriptionId) {
    this.prescriptionId = new mongoose.Types.ObjectId().toHexString();
  }
  next();
});

// ✅ Enable automatic decryption when retrieving data
PrescriptionSchema.set('toJSON', { getters: true });
PrescriptionSchema.set('toObject', { getters: true });

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
