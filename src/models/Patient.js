import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prescriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  ],
});

export const Patient = mongoose.model('Patient', PatientSchema);
