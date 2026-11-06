import { Router } from "express";
import menurouter from "./menuroutetwo.js";
import orderRouter from "./ordersroutes.js";
import orderItemRouter from "./ordersitemsroutes.js";
import authroute from "./authroute.js";
const router = Router();

router.get("/", (_req, res) =>
  res.json({ message: "Mayerfield BrewHaus Backend API v1" }),
);

// Mount the menu routes under the /menu path
router.use("/menu", menurouter);
router.use("/api/orders", orderRouter);
router.use("/api/order-items", orderItemRouter);
router.use("/auth", authroute);

export default router;
