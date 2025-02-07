import mongoose from 'mongoose';

const ROLES = {
  DOCTOR: 'doctor',
  PHARMACIST: 'pharmacist',
};

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: [ROLES.DOCTOR, ROLES.PHARMACIST],
    required: true,
  },
  licenseNumber: {
    type: String, // Unique license/registration #
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false, // will be set to true after admin verification
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
  },
});

export const User = mongoose.model('User', UserSchema);
