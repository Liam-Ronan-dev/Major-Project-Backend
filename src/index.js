import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

import prescriptionRoutes from './routes/prescription.js';

const app = express();
dotenv.config();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'hello world!' });
});

app.use('/api', prescriptionRoutes);

connectDB();

export default app;
