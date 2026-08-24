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
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  }),
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

const apiModules = [
  { name: "Projects", path: "/api/v1/project", note: "Real estate project content and media" },
  { name: "Green City", path: "/api/v1/greenCity", note: "Banner project data" },
  { name: "Square City", path: "/api/v1/squareCity", note: "Banner project data" },
  { name: "Industrial City", path: "/api/v1/industrialCity", note: "Banner project data" },
  { name: "Commercial Project", path: "/api/v1/commercialProject", note: "Commercial project data" },
  { name: "News & Events", path: "/api/v1/newsEvent", note: "Public news and event posts" },
  { name: "Partners", path: "/api/v1/partners", note: "Concern and partner logos" },
  { name: "About", path: "/api/v1/about", note: "About page content" },
  { name: "Contact Info", path: "/api/v1/contactInfo", note: "Office, phone, email settings" },
  { name: "Health", path: "/api/v1/health", note: "API uptime and database checks" },
];

const connectionState = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

const renderApiDashboard = () => {
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  const now = new Date().toISOString();
  const dbState = connectionState();
  const dbClass = dbState === "connected" ? "ok" : dbState === "connecting" ? "warn" : "muted";
  const moduleCards = apiModules
    .map(
      (item) => `
        <a class="card" href="${item.path}">
          <span class="card-kicker">Endpoint</span>
          <strong>${item.name}</strong>
          <small>${item.path}</small>
          <p>${item.note}</p>
        </a>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>North South Group API</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07110d;
        --panel: rgba(255,255,255,0.08);
        --panel-strong: rgba(255,255,255,0.13);
        --line: rgba(255,255,255,0.18);
        --text: #f8fff9;
        --muted: #b7c9bd;
        --green: #36d174;
        --gold: #f2b84b;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at 20% 12%, rgba(54,209,116,0.22), transparent 28rem),
          radial-gradient(circle at 84% 8%, rgba(242,184,75,0.18), transparent 24rem),
          linear-gradient(135deg, #07110d 0%, #0c2116 44%, #07110d 100%);
        color: var(--text);
      }
      main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 54px 0; }
      .hero {
        border: 1px solid var(--line);
        border-radius: 30px;
        padding: clamp(28px, 5vw, 58px);
        background: linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05));
        box-shadow: 0 30px 120px rgba(0,0,0,0.38);
        overflow: hidden;
        position: relative;
      }
      .hero:after {
        content: "";
        position: absolute;
        inset: auto -80px -120px auto;
        width: 340px;
        height: 340px;
        border-radius: 999px;
        background: rgba(54,209,116,0.14);
        filter: blur(12px);
      }
      .eyebrow {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        border: 1px solid rgba(54,209,116,0.36);
        background: rgba(54,209,116,0.12);
        color: #b8ffd2;
        border-radius: 999px;
        padding: 9px 14px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      h1 {
        margin: 24px 0 16px;
        max-width: 820px;
        font-size: clamp(42px, 7vw, 82px);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }
      .lead { max-width: 760px; color: var(--muted); font-size: clamp(16px, 2vw, 20px); line-height: 1.8; }
      .status-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.08);
        border-radius: 999px;
        padding: 12px 15px;
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
      }
      .dot { width: 10px; height: 10px; border-radius: 999px; background: var(--muted); box-shadow: 0 0 18px currentColor; }
      .ok .dot { background: var(--green); color: var(--green); }
      .warn .dot { background: var(--gold); color: var(--gold); }
      .muted .dot { background: #9ca3af; color: #9ca3af; }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
      .section-title { margin: 38px 0 0; color: #dfffe8; font-size: 15px; letter-spacing: 0.14em; text-transform: uppercase; }
      .card {
        min-height: 176px;
        padding: 22px;
        border-radius: 22px;
        border: 1px solid var(--line);
        background: var(--panel);
        color: inherit;
        text-decoration: none;
        transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
      }
      .card:hover { transform: translateY(-3px); background: var(--panel-strong); border-color: rgba(54,209,116,0.42); }
      .card-kicker { color: var(--green); font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
      .card strong { display: block; margin-top: 13px; font-size: 22px; }
      .card small { display: block; margin-top: 8px; color: #9be7b7; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      .card p { margin: 15px 0 0; color: var(--muted); line-height: 1.6; font-size: 14px; }
      .footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 28px; color: #91a99a; font-size: 13px; }
      @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } main { padding-top: 28px; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <span class="eyebrow"><span>North South Group</span><span>API</span></span>
        <h1>Backend is online and ready.</h1>
        <p class="lead">
          This service powers project pages, banner projects, concerns, gallery media, contact settings,
          and admin-managed content for the North South Group website.
        </p>
        <div class="status-row">
          <span class="pill ok"><span class="dot"></span> API connected</span>
          <span class="pill ${dbClass}"><span class="dot"></span> Database: ${dbState}</span>
          <a class="pill ok" href="/api/v1/health"><span class="dot"></span> Health check</a>
          <span class="pill"><span class="dot"></span> ${environment}</span>
        </div>
      </section>

      <h2 class="section-title">Available Modules</h2>
      <section class="grid">${moduleCards}</section>

      <div class="footer">
        <span>Last rendered: ${now}</span>
        <span>Base path: /api/v1</span>
      </div>
    </main>
  </body>
</html>`;
};

// routes
app.get(["/", "/api", "/api/v1"], (req, res) => {
  res.status(200).type("html").send(renderApiDashboard());
});

app.use("/api/v1", ensureDB, limiter, AppRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
