import { Router } from "express";
import menurouter from "./menuroutetwo.js";
import authroute from "./authroute.js";
const router = Router();

router.get("/", (_req, res) =>
  res.json({ message: "Mayerfield BrewHaus Backend API v1" }),
);

// Mount the menu routes under the /menu path
router.use("/menu", menurouter);
router.use("/auth", authroute);

export default router;
