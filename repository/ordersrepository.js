import { pool } from "../config/db.js";

export class OrderRepository {
  async listOrders(userId) {
    const userFilter = userId ? "WHERE o.user_id = $1" : "";
    const query = `
      SELECT o.*, u.user_name, u.user_email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${userFilter}
      ORDER BY o.created_at DESC;
    `;
    const { rows } = await pool.query(query, userId ? [userId] : []);
    return rows;
  }

  async getOrderById(id, userId) {
    const userFilter = userId ? "AND o.user_id = $2" : "";
    const orderQuery = `
      SELECT o.*, u.user_name, u.user_email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 ${userFilter};
    `;
    const itemsQuery = `
      SELECT oi.*, mi.name, mi.image, c.name AS category_name
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.id
      JOIN categories c ON mi.category_id = c.id
      WHERE oi.order_id = $1;
    `;

    const client = await pool.connect();
    try {
      const orderResult = await client.query(
        orderQuery,
        userId ? [id, userId] : [id],
      );
      if (orderResult.rows.length === 0) return null;

      const itemsResult = await client.query(itemsQuery, [id]);

      const order = orderResult.rows[0];
      order.items = itemsResult.rows;
      return order;
    } finally {
      client.release();
    }
  }

  async createOrder(orderData, items) {
    // orderData: { user_id, total_amount, status, stripe_session_id }
    // items: [{ item_id, quantity, price_at_purchase }]
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status, stripe_session_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const orderValues = [
        orderData.user_id,
        orderData.total_amount,
        orderData.status || "pending",
        orderData.stripe_session_id || null,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      const newOrder = orderResult.rows[0];

      const insertedItems = [];
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, item_id, quantity, price_at_purchase)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `;
        const itemValues = [
          newOrder.id,
          item.item_id,
          item.quantity,
          item.price_at_purchase,
        ];
        const itemResult = await client.query(itemQuery, itemValues);
        insertedItems.push(itemResult.rows[0]);
      }

      await client.query("COMMIT");
      newOrder.items = insertedItems;
      return newOrder;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(id, status, stripeSessionId = null) {
    const query = `
      UPDATE orders 
      SET status = $1, 
          stripe_session_id = COALESCE($2, stripe_session_id)
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, stripeSessionId, id]);
    return rows[0] || null;
  }

  async deleteOrder(id) {
    const query = "DELETE FROM orders WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
