import { Router } from "express";
import menurouter from "./menuroutetwo.js";
const router = Router();

router.get("/", (_req, res) =>
  res.json({ message: "Mayerfield BrewHaus Backend API v1" }),
);

// Mount the menu routes under the /menu path
router.use("/menu", menurouter);

export default router;
