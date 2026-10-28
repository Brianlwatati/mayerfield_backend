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
}
