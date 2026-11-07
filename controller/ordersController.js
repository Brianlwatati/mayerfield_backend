import { OrderService } from "../service/ordersevice.js";

const orderService = new OrderService();

export class OrderController {
  // POST /api/orders/checkout
  async createCheckoutSession(req, res, next) {
    try {
      // req.user comes from your authenticateUser middleware (contains user id)
      const userData = { user_id: req.user.id };
      const { items } = req.body; // Array of items with item_id, quantity, price_at_purchase, name

      const checkoutData = await orderService.createStripeCheckoutOrder(
        userData,
        items,
      );

      res.status(201).json({
        success: true,
        message: "Stripe checkout session created successfully",
        data: checkoutData.order,
        url: checkoutData.url, // Frontend redirects user to this URL
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders(req.user);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/:id
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id, req.user);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/verify-payment
  async verifyPayment(req, res, next) {
    try {
      const { session_id } = req.query;
      const result = await orderService.verifyAndUpdatePayment(
        session_id,
        req.user,
      );

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/orders
  async createOrder(req, res, next) {
    try {
      // Expects req.body to contain order details and an array of items
      // Example: { user_id, total_amount, status, stripe_session_id, items: [...] }
      const { items, ...orderData } = req.body;
      const newOrder = await orderService.createOrder(orderData, items);

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: newOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/orders/:id/status
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, stripe_session_id } = req.body;

      const updatedOrder = await orderService.updateOrderStatus(
        id,
        status,
        stripe_session_id,
      );

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/orders/:id
  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      await orderService.deleteOrder(id);

      res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
