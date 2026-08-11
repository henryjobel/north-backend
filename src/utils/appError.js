import { NODE_ENV } from "../config/siteEnv.js";

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    if (NODE_ENV !== "production") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;

