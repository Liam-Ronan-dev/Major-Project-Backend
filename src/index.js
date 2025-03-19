// CORS
import cors from 'cors';
import { corsOptions } from './config/corsOptions.js';

// Logger for requests - url, origin, user-agent, method
import { logger } from './middleware/logger.js';

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { connectDB } from './config/db.js';

// Resource Routes
import userRoutes from './routes/User.js';
import patientRoutes from './routes/Patient.js';
import prescriptionRoutes from './routes/prescription.js';
import appointmentRoutes from './routes/Appointment.js';
import medicationRoutes from './routes/Medication.js';

import { errorHandlerLogger } from './middleware/errors.js';

const app = express();

// Use a logger to display request status code, origin, time/date etc
app.use(logger);

// Allowing the Front-end to make requests to the Backend API
app.use(cors(corsOptions));

// Apply Helmet to Secure HTTP Headers
app.use(helmet());

app.use(express.json()); // Parse JSON Requests
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ message: 'hello world!' });
});

app.use('/api', userRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', patientRoutes);
app.use('/api', medicationRoutes);

app.use(errorHandlerLogger);
connectDB();

export default app;
