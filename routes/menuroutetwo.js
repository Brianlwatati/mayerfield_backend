import { Router } from "express";
import { MenuController } from "../controller/menuController.js";
// Adjust these import paths to match your actual authentication middleware
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const menurouter = Router();
const menuController = new MenuController();

// --- Public Routes ---
// Anyone can view the menu items
menurouter.get("/", (req, res, next) =>
  menuController.getAllMenus(req, res, next),
);

menurouter.get("/:id", (req, res, next) =>
  menuController.getMenuById(req, res, next),
);

// --- Protected Routes ---
// Only authenticated users with 'admin' role can create, update, or delete menu items
menurouter.post(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res, next) => menuController.createMenuItem(req, res, next),
);

menurouter.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res, next) => menuController.updateMenuItem(req, res, next),
);

menurouter.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res, next) => menuController.deleteMenuItem(req, res, next),
);

export default menurouter;
