import { validationResult } from 'express-validator';
import logEvents from './logger.js';

export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

// export const errorHandler = (err, req, res, next) => {
//   console.log(err.stack);

//   return res.status(err.status || 500).json({
//     message: err.message || 'Internal Server Error',
//     errors: err.errors || [],
//   });
// };

// Error handler for the logger
export const errorHandlerLogger = (err, req, res) => {
  const errMessage = err.message;
  const status = res.statusCode ? res.statusCode : 500;

  logEvents(
    `${err.name}: ${errMessage}\t${req.method}\t${req.url}\t${req.headers.origin}, 'errLog.log`
  );

  console.log(err.stack);

  res.status(status);

  res.json({ message: errMessage });
};
