import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import mongoose from "mongoose";
import globalErrorHandler from "./controllers/errorController.js";
import AppRoutes from "./routes/index.js";
import AppError from "./utils/appError.js";
import { MONGO_URI } from "./config/siteEnv.js";

const app = express();

// Trust nginx reverse proxy — required so req.ip gives the real client IP
// Without this, all requests appear to come from 127.0.0.1 (nginx) and
// the rate limiter blocks everyone after 100 total requests
app.set("trust proxy", 1);

// Connect to MongoDB — proper serverless singleton pattern
let connectionPromise = null;
const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectionPromise) return connectionPromise;
  connectionPromise = mongoose.connect(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  }).then(() => {
    console.log("DB Connected!");
  }).catch((err) => {
    console.error("DB connection error:", err);
    connectionPromise = null;
    throw err;
  });
  return connectionPromise;
};

// Middleware to ensure DB is connected before every request
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
};

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
  })
);

const options = [
  cors({ origin: true, credentials: true }),
  express.json({ limit: "30mb" }),
  morgan("dev"),
  compression({
    level: 6,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
  helmet(),
];

app.use("*", options);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

// routes
app.get("/", (req, res) =>
  res.json({
    status: "success",
    message: "Server is running :)",
  })
);

app.use("/api/v1", ensureDB, limiter, AppRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
