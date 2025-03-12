import mongoose from 'mongoose';

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
  dosages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dosage',
    },
  ],
  specificInstructions: {
    type: String,
    required: true,
  },
});

export const Item = mongoose.model('Item', ItemSchema);
