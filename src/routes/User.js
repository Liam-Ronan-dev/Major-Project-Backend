import express from 'express';
const router = express.Router();

import { loginUser, registerUser } from '../controllers/User.js';
import {
  validateLoginUser,
  validateRegisterUser,
} from '../Validators/validateUser.js';
import { handleInputErrors } from '../middleware/errors.js';

router.post(
  '/auth/register',
  validateRegisterUser,
  handleInputErrors,
  registerUser
);

router.post('/auth/login', validateLoginUser, handleInputErrors, loginUser);

export default router;
