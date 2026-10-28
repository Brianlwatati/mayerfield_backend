import { Router } from "express";
import { MenuController } from "../controller/menuController.js";

const menurouter = Router();
const menuController = new MenuController();

// Bind controller methods to routes
menurouter.get("/", (req, res, next) =>
  menuController.getAllMenus(req, res, next),
);
menurouter.get("/:id", (req, res, next) =>
  menuController.getMenuById(req, res, next),
);

export default menurouter;
