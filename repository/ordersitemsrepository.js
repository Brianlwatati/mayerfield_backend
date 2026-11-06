import { pool } from "../config/db.js";

export class OrderItemRepository {
  async getItemsByOrderId(orderId) {
    const query = `
      SELECT oi.*, mi.name, mi.description, mi.image 
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.id
      WHERE oi.order_id = $1;
    `;
    const { rows } = await pool.query(query, [orderId]);
    return rows;
  }

  async addItemsToOrder(orderId, items) {
    // items: [{ item_id, quantity, price_at_purchase }]
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const insertedItems = [];

      for (const item of items) {
        const query = `
          INSERT INTO order_items (order_id, item_id, quantity, price_at_purchase)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `;
        const { rows } = await client.query(query, [
          orderId,
          item.item_id,
          item.quantity,
          item.price_at_purchase,
        ]);
        insertedItems.push(rows[0]);
      }

      await client.query("COMMIT");
      return insertedItems;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteOrderItem(id) {
    const query = "DELETE FROM order_items WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
