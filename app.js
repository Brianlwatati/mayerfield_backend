import express from "express";
import cors from "cors";
import router from "./routes/router.js";

// If API_PREFIX=/api/v1 and routes.ts contains /auth/login the final endpoint becomes POST /api/v1/auth/login
const apiprefix = process.env.API_PREFIX || "/api/v1";

export const app = express();

/** Multiple origins e.g CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000 */
const allowedOrigins = process.env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) || ["http://localhost:3000,http://127.0.0.1:3000"];

console.log("Allowed CORS origins:", allowedOrigins);
app.use(
  cors({
    origin: allowedOrigins || true,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "The Mayerfield BrewHaus Backend service is healthy",
  });
});

// Base route
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Mayerfield BrewHaus Backend is running smoothly ☕",
  });
});

/* API routes */
app.use(apiprefix, router);
