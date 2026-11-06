import { Router } from "express";
import { CategoryController } from "../controller/categorycontroller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const categoryRouter = Router();
const categoryController = new CategoryController();

// --- Public Routes ---
// Anyone can view categories
categoryRouter.get("/", (req, res, next) =>
  categoryController.getAllCategories(req, res, next),
);

categoryRouter.get("/:id", (req, res, next) =>
  categoryController.getCategoryById(req, res, next),
);

// --- Protected Routes ---
// Only admins or managers can create, update, or delete categories
categoryRouter.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "manager"),
  (req, res, next) => categoryController.createCategory(req, res, next),
);

categoryRouter.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "manager"),
  (req, res, next) => categoryController.updateCategory(req, res, next),
);

categoryRouter.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "manager"),
  (req, res, next) => categoryController.deleteCategory(req, res, next),
);

export default categoryRouter;
