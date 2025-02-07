import express from 'express';

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../controllers/User.js';
import {
  validateLoginUser,
  validateRegisterUser,
} from '../Validators/validateUser.js';
import { handleInputErrors } from '../middleware/errors.js';

const router = express.Router();

// Register Route
router.post(
  '/auth/register',
  validateRegisterUser,
  handleInputErrors,
  registerUser
);

// Login Route
router.post('/auth/login', validateLoginUser, handleInputErrors, loginUser);

// Refresh Token Route
router.post('/auth/refresh', refreshAccessToken);

// Logout Route
router.post('/auth/logout', logoutUser);

export default router;
