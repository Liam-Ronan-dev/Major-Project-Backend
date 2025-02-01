import { User } from '../models/User.js';
import {
  createJWT,
  hashField,
  compareField,
  checkPasswordStrength,
} from '../modules/auth.js';

// Register A User
export const registerUser = async (req, res) => {
  try {
    const { email, password, licenseNumber, role } = req.body;

    // Validate input
    if (!email || !password || !licenseNumber || !role) {
      return res
        .status(422)
        .json({ message: 'Please fill in all form fields' });
    }

    // Validate licenseNumber - only 6 digits
    if (!/^\d{6}$/.test(licenseNumber)) {
      return res
        .status(400)
        .json({
          message: 'License number must be exactly 6 digits (numeric only)',
        });
    }

    // Validate role
    const validRoles = ['doctor', 'pharmacist'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res
        .status(400)
        .json({ message: 'Invalid role. Choose doctor or pharmacist' });
    }

    // Check if email already exists
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordCheck = checkPasswordStrength(password);
    if (!passwordCheck.strong) {
      return res.status(400).json({
        message: 'Password is too weak',
        suggestions: passwordCheck.errors, // ✅ Return password improvement suggestions
      });
    }

    // Check for duplicate license number before hashing
    const users = await User.find(); // Get all users (hashed license numbers)
    for (const user of users) {
      const isMatch = await compareField(licenseNumber, user.licenseNumber);
      if (isMatch) {
        return res
          .status(409)
          .json({ message: 'License number already exists' });
      }
    }

    // Hash password & license number
    const hashedPassword = await hashField(password);
    const hashedLicenseNumber = await hashField(licenseNumber);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      licenseNumber: hashedLicenseNumber, // ✅ Store hashed license number
      role: role.toLowerCase(),
    });

    // Save user to database
    await user.save();

    // Simulate verification process (10-second delay)
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    // Set isVerified to true
    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = createJWT(user);

    // Send response after verification
    res.status(201).json({
      message: 'User registered successfully. Verification complete.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Registration failed', error: error.message });
  }
};
