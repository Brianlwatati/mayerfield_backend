import { pool } from "../config/db.js";

export class CategoryRepository {
  // Fetch all categories
  async listCategories() {
    const query = "SELECT * FROM categories ORDER BY name ASC;";
    const { rows } = await pool.query(query);
    return rows;
  }

  // Fetch a single category by its ID
  async getCategoryById(id) {
    const query = "SELECT * FROM categories WHERE id = $1;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Create a new category
  async createCategory(categoryData) {
    const { name, description } = categoryData;
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, description]);
    return rows[0];
  }

  // Update an existing category
  async updateCategory(id, categoryData) {
    const { name, description } = categoryData;
    const query = `
      UPDATE categories 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description)
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, description, id]);
    return rows[0] || null;
  }

  // Delete a category
  async deleteCategory(id) {
    const query = "DELETE FROM categories WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
