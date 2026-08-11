import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../models/userModel.js";
import { JWT_SECRET } from "../config/siteEnv.js";

// restrict by role - authorization
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};

// Check user login or not
export const isLoggedIn = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token && req.headers.cookie) {
    const rawToken = req.headers.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("token="));

    if (rawToken) {
      token = decodeURIComponent(rawToken.split("=")[1]);
    }
  }

  if (!token) {
    return next(new AppError("Please login to access to this resource", 403));
  }

  const decodedData = jwt.verify(token, JWT_SECRET);

  if (!decodedData.id) {
    return next(new AppError("Invalid Token", 403));
  }

  req.user = await User.findById(decodedData.id);
  next();
});
