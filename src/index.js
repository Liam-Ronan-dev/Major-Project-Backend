// CORS
import cors from 'cors';
import { corsOptions } from './config/corsOptions.js';
import { allowedOrigins } from './config/allowedOrigins.js';

// Logger for requests - url, origin, user-agent, method
import { logger } from './middleware/logger.js';

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/db.js';

// Resource Routes
import userRoutes from './routes/User.js';
import patientRoutes from './routes/Patient.js';
import prescriptionRoutes from './routes/prescription.js';
import appointmentRoutes from './routes/Appointment.js';
import medicationRoutes from './routes/Medication.js';
import adminRoutes from './routes/Admin.js';

import { errorHandlerLogger } from './middleware/errors.js';

const app = express();
export const server = http.createServer(app);

// Initialise socket.io
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  },
});

// Store connected users: Map of userId => socket.id
export const connectedUsers = new Map();

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`Registered user ${userId}`);
  });

  socket.on('disconnect', () => {
    for (const [userId, id] of connectedUsers.entries()) {
      if (id === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

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
app.use('/api/admin', adminRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', patientRoutes);
app.use('/api', medicationRoutes);

app.use(errorHandlerLogger);
connectDB();

export default app;
