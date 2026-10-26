import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hashedPassword],
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "Server error during registration (Email might already exist).",
    });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.rows[0].id, // Added id here
        email: user.rows[0].email,
        name: user.rows[0].name,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

export default router;
