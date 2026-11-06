import { pool } from "../config/db.js";

export class AuthRepository {
  async findByEmail(email) {
    const query = `
      SELECT id, user_name AS name, user_email AS email, user_password AS password, created_at
      FROM users
      WHERE user_email = $1;
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null; // Return user object or null
  }

  async createUser(name, email, hashedPassword) {
    const query = `
      INSERT INTO users (user_name, user_email, user_password)
      VALUES ($1, $2, $3) 
      RETURNING id, user_name AS name, user_email AS email, created_at;
    `;
    const { rows } = await pool.query(query, [name, email, hashedPassword]);
    return rows[0];
  }
}
