import { OrderService } from "../service/ordersevice.js";

const orderService = new OrderService();

export class OrderController {
  // GET /api/orders
  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();

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
      const order = await orderService.getOrderById(id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
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
