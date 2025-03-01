import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Medication name
  stock: { type: Number, required: true, min: 0 }, // Quantity available
  supplier: { type: String, required: true }, // Supplier name
  price: { type: Number, required: true, min: 0 }, // Price per unit
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // Pharmacist who added the medication
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
});

export const Medication = mongoose.model('Medication', MedicationSchema);
