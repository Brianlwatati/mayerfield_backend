import dotenv from "dotenv";
dotenv.config(); // Must be called first!

import pkg from "pg";
const { Pool } = pkg;

// Debug check to verify your connection string is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
