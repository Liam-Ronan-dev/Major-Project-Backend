import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// Function for hashing fields into the database
export const hashField = async (field) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(field, salt);
};

// Function for comparing user credentials with hashed value in the database
export const compareField = async (field, hashedField) => {
  return await bcrypt.compare(field, hashedField);
};

// Create JWT - using JWT secret
export const createJWT = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    subject: 'AccessAPI',
    expiresIn: '1h',
  });
  return token;
};

// Protect Middleware
export const ensureAuthenticated = (req, res, next) => {
  const bearer = req.headers.authorization;

  // Check if Authorization header exists and is properly formatted
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Not authorized. Missing or invalid token' });
  }

  // Extract only token part
  const token = bearer.split(' ')[1];

  try {
    // Verify token
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID to `req.user`
    req.user = { id: user.id };

    // Proceed to the next middleware
    next();
  } catch (err) {
    console.error(`Error verifying the token: ${err}`);
    return res.status(401).json({ message: 'Access Token invalid or expired' });
  }
};
