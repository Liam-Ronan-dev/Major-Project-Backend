import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const ItemSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true,
  },
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
  },
  specificInstructions: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  repeats: {
    type: Number,
    default: 0,
  },
  dosage: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  amount: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  pharmacistNote: {
    type: String,
    default: null,
    set: encryptData,
    get: decryptData,
  },
});

ItemSchema.set('toJSON', { getters: true });
ItemSchema.set('toObject', { getters: true });

export const Item = mongoose.model('Item', ItemSchema);
