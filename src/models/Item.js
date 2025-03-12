import mongoose from 'mongoose';
import { encryptData, decryptData } from '../utils/encryption.js';

const ItemSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true,
  },
  medications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
    },
  ],
  specificInstructions: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },
  dosages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dosage',
    },
  ],
});

ItemSchema.set('toJSON', { getters: true });
ItemSchema.set('toObject', { getters: true });

export const Item = mongoose.model('Item', ItemSchema);
