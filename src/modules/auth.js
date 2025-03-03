import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Use env file contents
dotenv.config();

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
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    subject: 'AccessAPI',
    expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
  });
  return token;
};

// Create a Refresh token - Saves the user logging in again after the expiry of the JWT token above
export const createRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    subject: 'refreshToken',
    expiresIn: process.env.JWT_REFRESH_TOKEN_SECRET_EXPIRES_IN,
  });
  return refreshToken;
};

export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.log(err);
    return null; // if token is expired/invalid
  }
};

// Protect Middleware
export const ensureAuthenticated = (req, res, next) => {
  const bearer = req.headers.authorization;

  // Check if Authorization header exists and is properly formatted
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized. Missing or invalid token' });
  }

  // Extract only token part
  const token = bearer.split(' ')[1];
  const decodedToken = verifyToken(token, process.env.JWT_SECRET);

  if (!decodedToken) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decodedToken;
  next();
};
