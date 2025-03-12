import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const DosageSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
  },
  amount: { type: String, required: true, set: encryptData, get: decryptData },
  frequency: { type: String, required: true, set: encryptData, get: decryptData },
  duration: { type: String, required: true, set: encryptData, get: decryptData },
  notes: { type: String, set: encryptData, get: decryptData },
});

DosageSchema.set('toJSON', { getters: true });
DosageSchema.set('toObject', { getters: true });

export const Dosage = mongoose.model('Dosage', DosageSchema);
