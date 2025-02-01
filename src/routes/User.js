import express from 'express';
const router = express.Router();

import { registerUser } from '../controllers/User.js';
import { validateRegisterUser } from '../middleware/validateUser.js';
import { handleInputErrors } from '../middleware/errors.js';

router.post(
  '/auth/register',
  validateRegisterUser,
  handleInputErrors,
  registerUser
);

export default router;
