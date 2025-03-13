import express from 'express';

import {
  getAllPharmacists,
  getPharmacistById,
  loginUser,
  logoutUser,
  mfaLogin,
  refreshAccessToken,
  registerUser,
} from '../controllers/User.js';
// Testing again
import { validateLoginUser, validateRegisterUser } from '../validators/validateUser.js';
import { handleInputErrors } from '../middleware/errors.js';
import { ensureAuthenticated } from '../modules/auth.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Register Route
router.post('/auth/register', validateRegisterUser, handleInputErrors, registerUser);

// Login Route
router.post('/auth/login', validateLoginUser, handleInputErrors, loginUser);

// MFA Login
router.post('/auth/login/mfa', mfaLogin);

// Refresh Token Route
router.post('/auth/refresh', refreshAccessToken);

// Logout Route
router.post('/auth/logout', logoutUser);

// Get all Pharmacists
router.get('/pharmacists', ensureAuthenticated, authorizeRoles('doctor'), getAllPharmacists);

// Get single pharmacist by ID
router.get('/pharmacist/:id', ensureAuthenticated, authorizeRoles('doctor'), getPharmacistById);

export default router;
