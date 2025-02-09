import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pharmacistId: {
    // Assigned pharmacist
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Reference to a Patient model
    required: true,
  },
  medications: [
    {
      name: {
        type: String,
        required: true,
      },
      dosage: {
        type: String,
        required: true,
      },
      frequency: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      form: {
        type: String,
        required: true,
      },
      notes: {
        type: String,
      },
    },
  ],
  diagnosis: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  pharmacyName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
