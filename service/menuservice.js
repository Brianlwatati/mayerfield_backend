import { MenuRepository } from "../repository/menurepository.js";

export class MenuService {
  constructor() {
    this.menuRepository = new MenuRepository();
  }

  async getAllMenuItems(categoryId) {
    const items = await this.menuRepository.listmenu(categoryId);
    return items;
  }

  async getMenuItem(id) {
    const item = await this.menuRepository.menubyid(id);

    if (!item) {
      const error = new Error("Menu item not found");
      error.statusCode = 404;
      throw error;
    }

    return item;
  }

  async getMenuItemsByCategory(categoryId) {
    const items = await this.menuRepository.getMenuByCategory(categoryId);
    return items;
  }

  async createMenuItem(itemData) {
    const { name, price, category_id } = itemData;
    if (!name || price === undefined || !category_id) {
      const error = new Error(
        "Missing required fields: name, price, and category_id are required.",
      );
      error.statusCode = 400;
      throw error;
    }

    const newItem = await this.menuRepository.createMenuItem(itemData);
    return newItem;
  }

  async updateMenuItem(id, itemData) {
    const updatedItem = await this.menuRepository.updateMenuItem(id, itemData);

    if (!updatedItem) {
      const error = new Error("Menu item not found");
      error.statusCode = 404;
      throw error;
    }

    return updatedItem;
  }

  async deleteMenuItem(id) {
    const deletedItem = await this.menuRepository.deleteMenuItem(id);

    if (!deletedItem) {
      const error = new Error("Menu item not found");
      error.statusCode = 404;
      throw error;
    }

    return deletedItem;
  }
}
