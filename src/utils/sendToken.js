// Create Token
import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN || 7);
  res.cookie("token", token, {
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Send token in JSON response (frontend will save it in localStorage)
  res.status(statusCode).json({
    status: "success",
    token,
    user,
    message,
  });
};

