import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';

// Create an appointment - Doctor
export const createAppointment = async (req, res) => {
  try {
    const { patientId, date, status, notes } = req.body;

    if (!patientId || !date || !status || !notes) {
      return res.status(400).json({
        message: 'All fields are required: patientId, date, status, notes',
      });
    }

    // Check if the doctor owns this patient
    const patient = await Patient.findOne({
      _id: patientId,
      doctorId: req.user.id,
    });

    if (!patient) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this patient' });
    }

    const newAppointment = await Appointment.create({
      doctorId: req.user.id,
      patientId,
      date,
      status,
      notes,
    });

    // When doctor creates an appointment, this will update the patient data with the new appointment
    patient.appointments.push(newAppointment._id);
    await patient.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Failed to create appointment' });
  }
};

// Get all Appointments - Doctor
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.user.id,
    })
      .populate('patientId', 'firstName lastName email phoneNumber') // Include Patient details
      .populate('doctorId', 'email'); // Include doctor details

    if (!appointments.length) {
      return res.status(200).json({ message: 'No Appointments Scheduled' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// Get a single appointment by ID - Doctor
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'firstName lastName email phoneNumber')
      .populate('doctorId', 'email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Failed to fetch appointment' });
  }
};

// Update an appointment - Doctor
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status, notes } = req.body;

    // Ensure required fields are present when updating
    if (!date || !status || !notes) {
      return res.status(400).json({ message: 'All fields are required: date, status, notes' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { date, status, notes },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
};

// Delete an appointment - Doctor
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAppointment = await Appointment.findByIdAndDelete({
      _id: id,
      doctorId: req.user.id, // Only delete if the doctor owns it
    });

    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Failed to delete appointment' });
  }
};
