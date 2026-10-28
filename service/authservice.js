import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repository/authrepository.js";

export class AuthService {
  constructor() {
    this.authRepo = new AuthRepository();
  }

  async login(email, password) {
    // 1. Find user in DB
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // 2. Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // 3. Sign JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Token expires in 1 day
    );

    // 4. Remove password hash before sending user info back
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  async register(name, email, password) {
    // Check if user already exists
    const existingUser = await this.authRepo.findByEmail(email);
    if (existingUser) {
      const error = new Error("Email is already in use.");
      error.statusCode = 409; // Conflict
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to DB
    const user = await this.authRepo.createUser(name, email, hashedPassword);

    // Optionally sign a token right upon registration so they're auto-logged in
    // const token = jwt.sign(
    //   { id: newUser.id, email: newUser.email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1d" },
    // );

    return { user };
  }
}
