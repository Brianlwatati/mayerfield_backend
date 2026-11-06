import { Router } from "express";
import menurouter from "./menuroutetwo.js";
import orderRouter from "./ordersroutes.js";
import orderItemRouter from "./ordersitemsroutes.js";
import categoryRouter from "./categoryroutes.js";
import authroute from "./authroute.js";
const router = Router();

router.get("/", (_req, res) =>
  res.json({ message: "Mayerfield BrewHaus Backend API v1" }),
);

router.use("/category", categoryRouter);
router.use("/menu", menurouter);
router.use("/orders", orderRouter);
router.use("/order-items", orderItemRouter);
router.use("/auth", authroute);

export default router;
