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
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET
  );
  return token;
};

// Protect Middleware
export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const [, token] = bearer.split(' ');

  if (!token) {
    res.status(401).json({ message: 'Not a valid token' });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error(`Error verifying the token: ${err}`);
    res.status(401).json({ message: 'Not a valid token' });
    return;
  }
};
