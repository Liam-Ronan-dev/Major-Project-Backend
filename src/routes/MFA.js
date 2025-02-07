import express from 'express';
import { generateMFASecret } from '../controllers/MFA.js';
import { ensureAuthenticated } from '../modules/auth.js';

const router = express.Router();

router.get('/auth/mfa/generate', ensureAuthenticated, generateMFASecret);

export default router;
