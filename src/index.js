import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from './config/db.js';

import userRoutes from './routes/User.js';
import MFARoutes from './routes/MFA.js';
import patientRoutes from './routes/Patient.js';
import prescriptionRoutes from './routes/prescription.js';

import { errorHandler } from './middleware/errors.js';

const app = express();
dotenv.config();

// Allowing the Front-end to make requests to the Backend API
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Apply Helmet to Secure HTTP Headers
app.use(helmet());

app.use(morgan('dev'));
app.use(express.json()); // Parse JSON Requests
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ message: 'hello world!' });
});

app.use('/api', userRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api', MFARoutes);
app.use('/api', patientRoutes);

app.use(errorHandler);
connectDB();

export default app;
