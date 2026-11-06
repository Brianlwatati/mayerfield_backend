import { pool } from "../config/db.js";

export class MenuRepository {
  // List menu items, optionally filtered by category_id
  async listmenu(categoryId = "All") {
    let query = `
      SELECT mi.*, c.name AS category_name 
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
    `;
    let params = [];

    if (categoryId && categoryId !== "All") {
      query += " WHERE mi.category_id = $1";
      params.push(categoryId);
    }

    query += " ORDER BY mi.created_at DESC;";
    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Fetch a single menu item by its ID with category details
  async menubyid(id) {
    const query = `
      SELECT mi.*, c.name AS category_name 
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Fetch all menu items belonging to a specific category ID
  async getMenuByCategory(categoryId) {
    const query = `
      SELECT mi.*, c.name AS category_name 
      FROM menu_items mi
      JOIN categories c ON mi.category_id = c.id
      WHERE mi.category_id = $1;
    `;
    const { rows } = await pool.query(query, [categoryId]);
    return rows;
  }

  // Create a menu item using category_id
  async createMenuItem(itemData) {
    const { name, description, price, category_id, image, is_popular } =
      itemData;
    const query = `
      INSERT INTO menu_items (name, description, price, category_id, image, is_popular)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      name,
      description,
      price,
      category_id,
      image,
      is_popular ?? false,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  // Update a menu item using category_id
  async updateMenuItem(id, itemData) {
    const { name, description, price, category_id, image, is_popular } =
      itemData;
    const query = `
      UPDATE menu_items 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category_id = COALESCE($4, category_id),
          image = COALESCE($5, image),
          is_popular = COALESCE($6, is_popular)
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      name,
      description,
      price,
      category_id,
      image,
      is_popular,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  // Delete a menu item by ID
  async deleteMenuItem(id) {
    const query = "DELETE FROM menu_items WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
