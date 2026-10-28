import { pool } from "../config/db.js";
export class MenuRepository {
  async listmenu(category = "All") {
    let query = "select * from menu_items";
    let params = [];

    if (category && category !== "All") {
      query += " WHERE category = $1";
      params.push(category);
    }

    const { rows } = await pool.query(query, params);
    return rows;
  }
  // Fetch a single menu item by its ID
  async menubyid(id) {
    const query = "SELECT * FROM menus WHERE id = $1;";
    const { rows } = await pool.query(query, [id]);

    // Return the item if found, otherwise return null
    return rows[0] || null;
  }
}
