import "dotenv/config";
import { Pool } from "pg";

// Debug check to verify your connection string is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set in environment variables.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Prevent idle-client errors from becoming uncaught EventEmitter errors.
pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});
