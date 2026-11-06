import { OrderItemService } from "../service/ordersitemservice.js";

const orderItemService = new OrderItemService();

export class OrderItemController {
  // GET /api/orders/:orderId/items
  async getItemsByOrderId(req, res, next) {
    try {
      const { orderId } = req.params;
      const items = await orderItemService.getItemsByOrderId(orderId);

      res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/orders/:orderId/items
  async addItemsToOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      // Expects req.body.items to be an array: [{ item_id, quantity, price_at_purchase }]
      const { items } = req.body;

      const addedItems = await orderItemService.addItemsToOrder(orderId, items);

      res.status(201).json({
        success: true,
        message: "Items added to order successfully",
        data: addedItems,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/order-items/:id
  async deleteOrderItem(req, res, next) {
    try {
      const { id } = req.params;
      await orderItemService.deleteOrderItem(id);

      res.status(200).json({
        success: true,
        message: "Order item deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
