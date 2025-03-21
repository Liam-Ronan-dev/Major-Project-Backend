import express from 'express';
import { verifyUser } from '../controllers/adminController.js';
const router = express.Router();

router.get('/verify/:userId/:token', verifyUser);

export default router;
