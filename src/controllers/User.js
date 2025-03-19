import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import {
  createJWT,
  hashField,
  compareField,
  createRefreshToken,
  verifyToken,
} from '../modules/auth.js';
import crypto from 'crypto';
import NodeCache from 'node-cache';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import * as dotenv from 'dotenv';

dotenv.config();
const cache = new NodeCache();

// Register A User
export const registerUser = async (req, res, next) => {
  const { email, password, licenseNumber, role } = req.body;

  try {
    // Check if email already exists
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Check for duplicate license number before hashing
    const existingUser = await User.findOne().lean();
    if (existingUser && (await compareField(licenseNumber, existingUser.licenseNumber))) {
      return res.status(409).json({ message: 'License number already exists' });
    }

    // Hash password & license number
    const hashedPassword = await hashField(password);
    const hashedLicenseNumber = await hashField(licenseNumber);

    // Generate MFA Secret
    const mfaSecret = authenticator.generateSecret();
    const mfaURI = authenticator.keyuri(email, 'Health-service.click', mfaSecret);
    const qrCode = await qrcode.toDataURL(mfaURI);

    // Create new user (Set `isVerified = true` before saving)
    const user = new User({
      email,
      password: hashedPassword,
      licenseNumber: hashedLicenseNumber,
      role: role.toLowerCase(),
      isVerified: true, // Set before saving (No second save required)
      mfaEnabled: true,
      mfaSecret, // Store the MFA secret
    });

    // Save user to database (Only once!)
    await user.save();

    return res.status(201).json({
      message: 'User registered successfully. Verification complete.',
      qrCode,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
    // Pass the error to the next middleware - error.js in middleware folder
    next(error);
  }
};

// login User Function
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Avoids timing attacks by checking both conditions together.
    const user = await User.findOne({ email }).select('+password'); // Explicitly include password
    if (!user || !(await compareField(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.mfaSecret) {
      return res.status(403).json({
        message: 'MFA setup is incomplete. Please scan the QR code and verify your MFA first.',
      });
    }

    // MFA is mandatory for all users
    const tempToken = crypto.randomUUID();
    const cacheKey = `temp_token:${tempToken}`;
    // Prevent crash is env is undefined
    const expiresInSeconds = process.env.TEMP_TOKEN_EXPIRES_IN || 300;

    cache.set(cacheKey, user._id, expiresInSeconds);

    return res.status(200).json({
      message: 'MFA Required. Enter your TOTP code',
      tempToken,
      expiresInSeconds,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login Failed', error: error.message });
    next(error);
  }
};

// MFA Login Function
export const mfaLogin = async (req, res) => {
  try {
    const { tempToken, totp } = req.body;

    if (!tempToken || !totp) {
      return res.status(422).json({ message: 'Please fill in all fields (tempToken & TOTP)' });
    }

    const cacheKey = `temp_token:${tempToken}`;
    const userId = cache.get(cacheKey);

    if (!userId) {
      return res.status(401).json({
        message: 'The provided temporary token is incorrect or expired',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verified = authenticator.verify({
      token: totp,
      secret: user.mfaSecret,
    });

    if (!verified) {
      return res.status(401).json({ message: 'The provided TOTP is incorrect or expired' });
    }

    // Delete tempToken after use
    cache.del(cacheKey);

    const accessToken = createJWT(user);
    const refreshToken = createRefreshToken(user);

    //Store refresh token in database
    await RefreshToken.create({ userId: user._id, token: refreshToken });
    // await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: true, // Ensures it's sent over HTTPS
      sameSite: 'None', // Allows cross-site requests
    });

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Check if refresh token exists
    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.id,
    });

    if (!storedToken) {
      return res.status(403).json({ message: 'Unauthorized refresh token.' });
    }

    // Retrieve the full user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: 'User not found.' });
    }

    // Generate a new access token
    const newAccessToken = createJWT(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing token.', error: error.message });
  }
};

// Logout User Function
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({ message: 'No refresh token found ' });
  }

  try {
    // Delete the refresh token from the database
    await RefreshToken.findOneAndDelete({ token: refreshToken });

    // Clear refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevents JavaScript access
      secure: true, // Ensures it's sent over HTTPS
      sameSite: 'None', // Allows cross-site requests
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

// Get all Pharmacists
export const getAllPharmacists = async (req, res) => {
  try {
    // Ensure only doctors can access
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Fetch all pharmacists
    const pharmacists = await User.find({ role: 'pharmacist' }).select('email firstName lastName');

    if (!pharmacists.length) {
      return res.status(404).json({ message: 'No pharmacists found' });
    }

    res.status(200).json({
      count: pharmacists.length,
      data: pharmacists,
    });
  } catch (error) {
    console.error('Error fetching pharmacists:', error);
    res.status(500).json({ message: 'Failed to fetch pharmacists' });
  }
};

// Get a single pharmacist by ID
export const getPharmacistById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure only doctors can access this
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Find the pharmacist by ID
    const pharmacist = await User.findOne({ _id: id, role: 'pharmacist' }).select(
      'email firstName lastName'
    );

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    res.status(200).json({
      data: pharmacist,
    });
  } catch (error) {
    console.error('Error fetching pharmacist:', error);
    res.status(500).json({ message: 'Failed to fetch pharmacist' });
  }
};
