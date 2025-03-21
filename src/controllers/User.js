import { User } from '../models/User.js';
import { createJWT, hashField, compareField } from '../modules/auth.js';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { sendEmail, verificationToken, verificationTokenExpires } from '../config/email.js';

// Register A User
export const registerUser = async (req, res, next) => {
  const { email, password, licenseNumber, role } = req.body;

  try {
    // Check if email already exists
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Correct way to check for duplicate license number
    const users = await User.find();
    for (const user of users) {
      const isMatch = await compareField(licenseNumber, user.licenseNumber);
      if (isMatch) {
        return res.status(409).json({ message: 'License number already exists' });
      }
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
      isVerified: false,
      verificationToken,
      verificationTokenExpires, // Set before saving
      mfaEnabled: true,
      mfaSecret, // Store the MFA secret
    });

    // Save user to database (Only once!)
    await user.save();

    // Send email to admin
    sendEmail(email, role, user._id);

    return res.status(201).json({
      message:
        'User registered. Awaiting admin approval - MFA setup required. Scan the QR code and enter the first OTP.',
      qrCode,
      email: user.email,
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
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await compareField(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          'Admin has not verified your account yet. Please wait until the verification process is completed.',
      });
    }

    // Store user ID in a temporary session cookie
    res.cookie('mfa_session', user._id.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 5 * 60 * 1000, // Expires in 5 minutes
    });

    return res.status(200).json({
      message: 'MFA Required. Enter your TOTP code',
    });
  } catch (error) {
    res.status(500).json({ message: 'Login Failed', error: error.message });
    next(error);
  }
};

// MFA Login Function
export const mfaLogin = async (req, res) => {
  try {
    const { totp } = req.body;
    const userId = req.cookies.mfa_session;

    if (!userId) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(userId).select('+mfaSecret');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verified = authenticator.verify({ token: totp, secret: user.mfaSecret });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid or expired TOTP' });
    }

    // Create JWT & Store in Cookie
    const accessToken = createJWT(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    // Clear MFA session
    res.clearCookie('mfa_session', { httpOnly: true, secure: true, sameSite: 'None' });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

// Logout User Function
export const logoutUser = async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });

  res.json({ message: 'Logged out successfully' });
};

//Get Logged-in User
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -mfaSecret -licenseNumber -mfaEnabled'
    ); // Exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error retrieving user data' });
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
