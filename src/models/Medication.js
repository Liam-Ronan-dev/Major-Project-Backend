import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true, set: encryptData, get: decryptData },
  form: { type: String, required: true, set: encryptData, get: decryptData },
  stock: { type: Number, required: true, min: 0 },
  supplier: { type: String, required: true, set: encryptData, get: decryptData },
  price: { type: Number, required: true, min: 0 },
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

MedicationSchema.set('toJSON', { getters: true });
MedicationSchema.set('toObject', { getters: true });

export const Medication = mongoose.model('Medication', MedicationSchema);
