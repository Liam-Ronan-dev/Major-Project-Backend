import mongoose from 'mongoose';
// import { encryptData, decryptData } from '../utils/encryption.js';

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
  pharmacyName: {
    type: String,
    required: true,
  },
  repeats: {
    type: Number,
    required: true,
  },
  generalInstructions: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  notes: {
    type: String,
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

PrescriptionSchema.pre('save', function (next) {
  if (!this.prescriptionId) {
    this.prescriptionId = new mongoose.Types.ObjectId().toHexString(); // Unique String ID
  }
  next();
});

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
