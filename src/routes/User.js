import express from 'express';
const router = express.Router();

import { registerUser } from '../controllers/User.js';

router.post('/auth/register', registerUser);

export default router;
