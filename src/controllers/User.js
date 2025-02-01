import { User } from '../models/User.js';
import { createJWT, hashField, compareField } from '../modules/auth.js';

// Register A User (Optimized)
export const registerUser = async (req, res, next) => {
  const { email, password, licenseNumber, role } = req.body;

  try {
    // Check if email already exists
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Check for duplicate license number before hashing
    const users = await User.find();
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

    // Create new user (Set `isVerified = true` before saving)
    const user = new User({
      email,
      password: hashedPassword,
      licenseNumber: hashedLicenseNumber,
      role: role.toLowerCase(),
      isVerified: true, // ✅ Set before saving (No second save required)
    });

    // Save user to database (Only once!)
    await user.save();

    // Generate JWT token
    const token = createJWT(user);

    return res.status(201).json({
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
    res.status(500).json({ message: error.message });
    // Pass the error to the next middleware - error.js in middleware folder
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await compareField(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createJWT(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login Failed', error: error.message });
    next(error);
  }
};
