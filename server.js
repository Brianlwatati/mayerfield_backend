import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authroute.js";
import menuRoutes from "./routes/menuroute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/menu", menuRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Mayerfield BrewHaus Backend is running smoothly ☕");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
