import { Router } from "express";
const router = Router();

router.get("/", (_req, res) =>
  res.json({ message: "Mayerfield BrewHaus Backend API v1" }),
);

export default router;
