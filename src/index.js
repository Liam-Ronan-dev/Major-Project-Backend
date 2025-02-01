import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import userRoutes from './routes/User.js';

import prescriptionRoutes from './routes/prescription.js';

const app = express();
dotenv.config();

// Allowing the Front-end to make requests to the Backend API
app.use(
  cors({
    origin: 'http://localhost:5173/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ message: 'hello world!' });
});

app.use('/api', userRoutes);
app.use('/api', prescriptionRoutes);

connectDB();

export default app;
