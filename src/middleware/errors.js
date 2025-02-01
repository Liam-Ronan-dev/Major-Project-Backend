import { validationResult } from 'express-validator';

export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.log(err.stack);

  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  });
};
