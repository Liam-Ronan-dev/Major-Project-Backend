import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  form: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  supplier: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const Medication = mongoose.model('Medication', MedicationSchema);
