import express from "express";
import pool from "../db/db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET all categories & menu items
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT * FROM menu_items";
    let params = [];

    if (category && category !== "All") {
      query += " WHERE category = $1";
      params.push(category);
    }

    const menu = await pool.query(query, params);

    // Categories constant matching your front-end needs
    const categories = [
      "All",
      "Hot Coffee",
      "Cold Drinks",
      "Bakery",
      "Tea & Others",
    ];

    res.json({ categories, items: menu.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch menu items." });
  }
});

// GET single menu item by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await pool.query("SELECT * FROM menu_items WHERE id = $1", [
      id,
    ]);

    if (item.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found." });
    }
    res.json(item.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error." });
  }
});

// POST create new menu item (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, price, category, image, isPopular } = req.body;

    const newItem = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image, is_popular) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, category, image, isPopular || false],
    );

    res.status(201).json({
      message: "Menu item created successfully",
      item: newItem.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create menu item." });
  }
});

// PUT update menu item (Protected)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, isPopular } = req.body;

    const updatedItem = await pool.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category = $4, image = $5, is_popular = $6 
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, image, isPopular, id],
    );

    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    res.json({
      message: "Menu item updated successfully",
      item: updatedItem.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update menu item." });
  }
});

// DELETE menu item (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await pool.query(
      "DELETE FROM menu_items WHERE id = $1 RETURNING *",
      [id],
    );

    if (deletedItem.rows.length === 0) {
      return res.status(404).json({ error: "Menu item not found." });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete menu item." });
  }
});

export default router;
