import "dotenv/config";
import { app } from "./app.js";
import { pool } from "./config/db.js";

const port = Number(process.env.PORT || 4000);

// 1. Save the server instance returned by app.listen()
const server = app.listen(port, () =>
  console.log(
    `Mayerfield Brewhaus Backend API listening on http://localhost:${port}`,
  ),
);

// 2. Create a unified graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} signal received: closing HTTP server...`);

  // Stop accepting new connections, finish existing ones
  server.close(async () => {
    console.log("HTTP server closed.");

    try {
      // Close database pool safely
      await pool.end();
      console.log("Database pool connections closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during database shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown if cleanup takes too long (e.g., 10 seconds)
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

// 3. Listen for both production (SIGTERM) and local development (SIGINT) signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
