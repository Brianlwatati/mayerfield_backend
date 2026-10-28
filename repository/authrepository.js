import { pool } from "../config/db";

export class AuthRepository {
  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1;";
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null; // Return user object or null
  }

  async createUser(name, email, hashedPassword) {
    const query = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, name, email, created_at;
    `;
    const { rows } = await pool.query(query, [name, email, hashedPassword]);
    return rows[0];
  }
}
