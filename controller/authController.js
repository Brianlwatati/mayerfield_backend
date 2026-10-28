import { AuthService } from "../service/authservice.js";

const authService = new AuthService();

export class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { token, user } = await authService.login(email, password);

      res.status(200).json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      next(error); // Automatically routes to your central error handler (catches 401)
    }
  }

  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      const { user } = await authService.register(name, email, password);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error); // Catches 409 conflict or other errors
    }
  }
}
