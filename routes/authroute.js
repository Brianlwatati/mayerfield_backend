import { Router } from "express";
import { AuthController } from "../controller/authController.js";

const authroute = Router();
const authcontroller = new AuthController();

// Bind controller methods to routes
authroute.post("/login", (req, res, next) =>
  authcontroller.login(req, res, next),
);
authroute.post("/register", (req, res, next) =>
  authcontroller.register(req, res, next),
);

export default authroute;
