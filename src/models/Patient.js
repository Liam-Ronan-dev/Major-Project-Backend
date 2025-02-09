import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const PatientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  lastName: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  dateOfBirth: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  gender: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  phoneNumber: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    set: encryptData,
    get: decryptData,
  },
  address: {
    street: { type: String, set: encryptData, get: decryptData },
    city: { type: String, set: encryptData, get: decryptData },
    postalCode: { type: String, set: encryptData, get: decryptData },
    country: {
      type: String,
      required: true,
      set: encryptData,
      get: decryptData,
    },
  },
  medicalHistory: [
    {
      condition: { type: String, set: encryptData, get: decryptData },
      diagnosedAt: Date,
      notes: { type: String, set: encryptData, get: decryptData },
    },
  ],
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  emergencyContact: {
    name: { type: String, set: encryptData, get: decryptData },
    relationship: String,
    phoneNumber: { type: String, set: encryptData, get: decryptData },
  },
  prescriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  ],
  createdAt: { type: Date, default: Date.now },
});

PatientSchema.set('toJSON', { getters: true });
PatientSchema.set('toObject', { getters: true });

export const Patient = mongoose.model('Patient', PatientSchema);
