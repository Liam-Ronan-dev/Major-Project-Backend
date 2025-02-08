import express from 'express';
import { generateMFASecret, mfaValidate } from '../controllers/MFA.js';
import { ensureAuthenticated } from '../modules/auth.js';

const router = express.Router();

router.get('/auth/mfa/generate', ensureAuthenticated, generateMFASecret);
router.post('/auth/mfa/validate', ensureAuthenticated, mfaValidate);

export default router;
