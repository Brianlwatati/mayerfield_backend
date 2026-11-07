import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate user via JWT from the Authorization header.
 * Expects header format: "Authorization: Bearer <token>"
 */
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Authentication token missing or malformed");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user payload (e.g., id, user_role, user_email) to request object
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.message = "Token has expired";
      error.statusCode = 401;
    } else if (error.name === "JsonWebTokenError") {
      error.message = "Invalid authentication token";
      error.statusCode = 401;
    }
    next(error);
  }
};

export const optionalAuthenticateUser = (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }

  return authenticateUser(req, res, next);
};

/**
 * Middleware factory to authorize specific user roles.
 * Example usage: authorizeRoles('admin', 'usertwo')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error("User not authenticated");
        error.statusCode = 401;
        throw error;
      }

      // Check if the user's role matches one of the allowed roles
      if (!allowedRoles.includes(req.user.user_role)) {
        const error = new Error("Access forbidden: Insufficient permissions");
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
