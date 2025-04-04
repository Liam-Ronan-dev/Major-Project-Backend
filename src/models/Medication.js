import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  activeSubstance: { type: String },
  authorisationNumber: { type: String },
  atcCode: { type: String },
  routeOfAdministration: { type: String },
  productId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const Medication = mongoose.model('Medication', MedicationSchema);
