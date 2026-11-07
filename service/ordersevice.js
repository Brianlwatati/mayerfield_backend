import { OrderRepository } from "../repository/ordersrepository.js";
import { OrderItemRepository } from "../repository/ordersitemsrepository.js";
import { stripe } from "../config/stripe.js";

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
  }

  // Create order & generate Stripe Checkout Session
  async createStripeCheckoutOrder(userData, items) {
    if (!items || items.length === 0) {
      const error = new Error("Cannot create an order without items");
      error.statusCode = 400;
      throw error;
    }

    // 1. Calculate total amount
    let totalAmount = 0;
    const lineItems = items.map((item) => {
      totalAmount += item.price_at_purchase * item.quantity;
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name || "Menu Item",
          },
          unit_amount: Math.round(item.price_at_purchase * 100),
        },
        quantity: item.quantity,
      };
    });

    // 2. Save order to database FIRST with 'pending' status to get an ID
    const orderData = {
      user_id: userData.user_id,
      total_amount: totalAmount,
      status: "pending",
    };

    const newOrder = await this.orderRepository.createOrder(orderData, items);

    // Make sure frontendBaseUrl is defined (e.g. from process.env.FRONTEND_URL)
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // 3. Create Stripe Checkout Session using the newly created order's ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: newOrder.id.toString(),
      payment_intent_data: {
        metadata: { order_id: newOrder.id.toString() },
      },
      success_url: `${frontendBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/cancel`,
    });

    await this.orderRepository.updateOrderStatus(
      newOrder.id,
      "pending",
      session.id,
    );

    // Return both the order details and the Stripe checkout URL for the frontend redirection
    return {
      order: newOrder,
      url: session.url,
    };
  }

  // Admins can view all orders; other callers can only view their own.
  async getAllOrders(user) {
    if (!user) {
      return [];
    }

    if (user.user_role === "admin") {
      return await this.orderRepository.listOrders();
    }

    if (!user.id) {
      return [];
    }

    return await this.orderRepository.listOrders(user.id);
  }

  // Get a specific order by ID along with its items
  async getOrderById(id, user) {
    if (!user || (!user.id && user.user_role !== "admin")) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const userId = user.user_role === "admin" ? undefined : user.id;
    const order = await this.orderRepository.getOrderById(id, userId);

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

  async verifyAndUpdatePayment(sessionId, user) {
    if (!sessionId) {
      const error = new Error("Session ID is required.");
      error.statusCode = 400;
      throw error;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.client_reference_id || session.metadata?.order_id;

    if (!orderId) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const order = await this.orderRepository.getOrderById(orderId, user.id);
    if (!order || order.stripe_session_id !== session.id) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (session.payment_status === "paid" && order.status !== "paid") {
      await this.orderRepository.updateOrderStatus(
        orderId,
        "paid",
        session.id,
      );
    }

    return { success: true, status: session.payment_status };
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
