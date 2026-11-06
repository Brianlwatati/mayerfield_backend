import { MenuRepository } from "../repository/menurepository.js";

export class MenuService {
  constructor() {
    this.menuRepository = new MenuRepository();
  }

  async getAllMenuItems(category) {
    const items = await this.menuRepository.listmenu(category);
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

  async createMenuItem(itemData) {
    // You can add validation logic here if needed (e.g. checking required fields)
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
