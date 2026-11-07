import { Router } from "express";
import { OrderController } from "../controller/ordersController.js";
import { OrderItemController } from "../controller/ordersitemscontroller.js";
import {
  authenticateUser,
  optionalAuthenticateUser,
  authorizeRoles,
} from "../middleware/auth.js";

const orderRouter = Router();
const orderController = new OrderController();
const orderItemController = new OrderItemController();

// Create Stripe checkout session route
orderRouter.post("/checkout", authenticateUser, (req, res, next) =>
  orderController.createCheckoutSession(req, res, next),
);

// --- Order Routes ---

// Public routes optionally use a token to return the caller's orders.
orderRouter.get("/", optionalAuthenticateUser, (req, res, next) =>
  orderController.getAllOrders(req, res, next),
);

// Get a single order by ID
orderRouter.get("/:id", optionalAuthenticateUser, (req, res, next) =>
  orderController.getOrderById(req, res, next),
);

// Create a new order (Authenticated users can checkout/place orders)
orderRouter.post("/", authenticateUser, (req, res, next) =>
  orderController.createOrder(req, res, next),
);

orderRouter.get(
  "/verify-payment",
  authenticateUser,
  orderController.verifyPayment,
);

// Update order status (e.g., payment success/failure or admin status change)
orderRouter.patch("/:id/status", authenticateUser, (req, res, next) =>
  orderController.updateOrderStatus(req, res, next),
);

// Delete an order (Admin only)
orderRouter.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res, next) => orderController.deleteOrder(req, res, next),
);

// --- Order Items Sub-Routes ---

// Get all line items for a specific order
orderRouter.get("/:orderId/items", authenticateUser, (req, res, next) =>
  orderItemController.getItemsByOrderId(req, res, next),
);

// Add items to an existing order
orderRouter.post("/:orderId/items", authenticateUser, (req, res, next) =>
  orderItemController.addItemsToOrder(req, res, next),
);

// Delete a specific order item line (Admin or order owner)
orderRouter.delete(
  "/items/:id",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res, next) => orderItemController.deleteOrderItem(req, res, next),
);

export default orderRouter;
