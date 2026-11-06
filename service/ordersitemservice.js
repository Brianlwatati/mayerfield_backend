import { OrderItemRepository } from "../repository/ordersitemsrepository.js";

export class OrderItemService {
  constructor() {
    this.orderItemRepository = new OrderItemRepository();
  }

  // Get all items belonging to a specific order
  async getItemsByOrderId(orderId) {
    const items = await this.orderItemRepository.getItemsByOrderId(orderId);
    return items;
  }

  // Add new line items to an existing order
  async addItemsToOrder(orderId, items) {
    if (!items || items.length === 0) {
      const error = new Error("No items provided to add to the order");
      error.statusCode = 400;
      throw error;
    }

    const addedItems = await this.orderItemRepository.addItemsToOrder(
      orderId,
      items,
    );
    return addedItems;
  }

  // Delete a specific order item line
  async deleteOrderItem(id) {
    const deletedItem = await this.orderItemRepository.deleteOrderItem(id);

    if (!deletedItem) {
      const error = new Error("Order item not found");
      error.statusCode = 404;
      throw error;
    }

    return deletedItem;
  }
}
