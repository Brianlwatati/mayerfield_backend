import { MenuService } from "../service/menuservice.js";

// Instantiate the service
const menuService = new MenuService();

export class MenuController {
  // GET /api/menus
  async getAllMenus(req, res, next) {
    try {
      const { category } = req.query;

      // Pass the category filter to your service/repository layer
      const menus = await menuService.getAllMenuItems(category);

      const allCategories = [
        "All",
        "Hot Coffee",
        "Cold Drinks",
        "Bakery",
        "Tea & Others",
      ];

      // If you specifically need to filter the categories array:
      let activeCategories = allCategories;
      if (category && category !== "All") {
        activeCategories = allCategories.filter((item) => item === category);
      }

      res.status(200).json({
        success: true,
        categories: allCategories,
        activeCategories,
        count: menus.length,
        items: menus,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/menus/:id
  async getMenuById(req, res, next) {
    try {
      const { id } = req.params;
      const menu = await menuService.getMenuItem(id);

      res.status(200).json({
        success: true,
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/menus
  async createMenuItem(req, res, next) {
    try {
      const newItem = await menuService.createMenuItem(req.body);

      res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        data: newItem,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/menus/:id
  async updateMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      const updatedItem = await menuService.updateMenuItem(id, req.body);

      res.status(200).json({
        success: true,
        message: "Menu item updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/menus/:id
  async deleteMenuItem(req, res, next) {
    try {
      const { id } = req.params;
      await menuService.deleteMenuItem(id);

      res.status(200).json({
        success: true,
        message: "Menu item deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
