import express from 'express';
const router = express.Router();

import {
  createPrescription,
  getAllPrescriptions,
  getSinglePrescription,
} from '../controllers/prescription.js';

router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getAllPrescriptions);
router.get('/prescription/:id', getSinglePrescription);

export default router;
