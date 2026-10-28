import { pool } from "../config/db";
export class MenuRepository {
  async listmenu() {
    const query = "select * from menu_items order by id asc";
    const { rows } = await pool.query(query);
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
