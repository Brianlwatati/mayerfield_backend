import { MenuService } from "../service/menuservice.js";

// Instantiate the service (or inject it depending on your preference)
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
        categories, // or keep sending allCategories if the UI needs tabs
        activeCategories, // or keep sending allCategories if the UI needs tabs
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
      next(error); // Catches 404s or DB errors and sends them to your error handler
    }
  }
}
