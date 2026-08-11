process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import dns from "dns";
import mongoose from "mongoose";
import app from "./app.js";
import { MONGO_URI, PORT } from "./config/siteEnv.js";

dns.setDefaultResultOrder("ipv4first");

let server;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("DB Connected!");
    server = app.listen(PORT, () =>
      console.log(`Server started on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
