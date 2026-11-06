import { Router } from "express";
import { OrderItemController } from "../controller/ordersitemscontroller.js";
import { authenticateUser, authorizeRoles } from "../middleware/auth.js";

const orderItemRouter = Router();
const orderItemController = new OrderItemController();

// All order item routes require authentication
orderItemRouter.use(authenticateUser);

// Get all items for a specific order
orderItemRouter.get("/order/:orderId", (req, res, next) =>
  orderItemController.getItemsByOrderId(req, res, next),
);

// Add items to an existing order
orderItemRouter.post("/order/:orderId", (req, res, next) =>
  orderItemController.addItemsToOrder(req, res, next),
);

// Delete a specific order item line by ID (Admin only or adjust as needed)
orderItemRouter.delete("/:id", authorizeRoles("admin"), (req, res, next) =>
  orderItemController.deleteOrderItem(req, res, next),
);

export default orderItemRouter;
