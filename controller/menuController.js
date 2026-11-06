import { MenuService } from "../service/menuservice.js";
import { CategoryService } from "../service/categoryservice.js";

// Instantiate the service
const menuService = new MenuService();
const categoryService = new CategoryService();

export class MenuController {
  // GET /api/menus?categoryId=...
  async getAllMenus(req, res, next) {
    try {
      const { categoryId } = req.query;

      // Pass the categoryId filter to your service/repository layer
      const menus = await menuService.getAllMenuItems(categoryId);
      const categories = await categoryService.getAllCategories();

      res.status(200).json({
        success: true,
        count: menus.length,
        items: menus,
        categories, // return categories as well if needed
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

  // GET /api/menus/category/:categoryId
  async getMenusByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const menus = await menuService.getMenuItemsByCategory(categoryId);

      res.status(200).json({
        success: true,
        count: menus.length,
        items: menus,
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
