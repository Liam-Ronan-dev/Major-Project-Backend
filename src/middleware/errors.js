import { validationResult } from 'express-validator';
import logEvents from './logger.js';

export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

// Error handler for the logger
export const errorHandlerLogger = (err, req, res) => {
  const errMessage = err.message;

  logEvents(`${err.name}: ${errMessage}\t${req.method}\t${req.url}`, 'errLog.log');

  console.log(err.stack);
  console.log(err.message);

  res.status(400).json({ message: errMessage });
};
