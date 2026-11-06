import { pool } from "../config/db.js";

export class MenuRepository {
  async listmenu(category = "All") {
    let query = "SELECT * FROM menu_items";
    let params = [];

    if (category && category !== "All") {
      query += " WHERE category = $1";
      params.push(category);
    }

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async menubyid(id) {
    const query = "SELECT * FROM menu_items WHERE id = $1;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async createMenuItem(itemData) {
    const { name, description, price, category, image, is_popular } = itemData;
    const query = `
      INSERT INTO menu_items (name, description, price, category, image, is_popular)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      name,
      description,
      price,
      category,
      image,
      is_popular ?? false,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updateMenuItem(id, itemData) {
    const { name, description, price, category, image, is_popular } = itemData;
    const query = `
      UPDATE menu_items 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category = COALESCE($4, category),
          image = COALESCE($5, image),
          is_popular = COALESCE($6, is_popular)
      WHERE id = $7
      RETURNING *;
    `;
    const values = [name, description, price, category, image, is_popular, id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async deleteMenuItem(id) {
    const query = "DELETE FROM menu_items WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
