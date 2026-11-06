import { OrderRepository } from "../repository/ordersrepository.js";
import { OrderItemRepository } from "../repository/ordersitemsrepository.js";

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
  }

  // Get all orders (useful for admin dashboards)
  async getAllOrders() {
    return await this.orderRepository.listOrders();
  }

  // Get a specific order by ID along with its items
  async getOrderById(id) {
    const order = await this.orderRepository.getOrderById(id);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  // Create a new order with its items inside a transaction
  async createOrder(orderData, items) {
    // orderData: { user_id, total_amount, status, stripe_session_id }
    // items: [{ item_id, quantity, price_at_purchase }]
    if (!items || items.length === 0) {
      const error = new Error("Cannot create an order without items");
      error.statusCode = 400;
      throw error;
    }

    const newOrder = await this.orderRepository.createOrder(orderData, items);
    return newOrder;
  }

  // Update order status (e.g., 'pending' -> 'paid' -> 'failed')
  async updateOrderStatus(id, status, stripeSessionId = null) {
    const updatedOrder = await this.orderRepository.updateOrderStatus(
      id,
      status,
      stripeSessionId,
    );

    if (!updatedOrder) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return updatedOrder;
  }

  // Delete an order
  async deleteOrder(id) {
    const deletedOrder = await this.orderRepository.deleteOrder(id);

    if (!deletedOrder) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    return deletedOrder;
  }
}
