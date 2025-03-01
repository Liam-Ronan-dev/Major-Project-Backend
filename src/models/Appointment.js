import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // The doctor assigned
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  }, // The patient
  date: { type: Date, required: true }, // Date & time of the appointment
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled',
    required: true,
  }, // Appointment status
  notes: { type: String, required: true }, // Notes from the doctor
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for updates
});

export const Appointment = mongoose.model('Appointment', AppointmentSchema);
