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

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    return null; // if token is expired/invalid
  }
};

// Protect Middleware
export const ensureAuthenticated = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Missing token' });
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = decodedToken;
  next();
};
