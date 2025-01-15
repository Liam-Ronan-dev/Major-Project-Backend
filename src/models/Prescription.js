import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // Auto-generate a unique ID
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor', // Reference to a Doctor model
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient', // Reference to a Patient model
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientAge: {
    type: Number,
    required: true,
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female'],
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
        required: true, // e.g., "3 times a day"
      },
      duration: {
        type: String,
        required: true, // e.g., "7 days"
      },
      notes: {
        type: String,
      },
    },
  ],
  diagnosis: {
    type: String,
    required: true, // e.g., "Flu", "Hypertension"
  },
  notes: {
    type: String, // Additional comments or instructions
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy', // Reference to a Pharmacy model
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
  encryptedData: {
    type: String, // Encrypted prescription details (optional for extra security)
  },
});

// Middleware to update `updatedAt` before saving
PrescriptionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
