export const errorHandler = (err, req, res, next) => {
  // Default to 500 server error if no status code is set
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error stack for debugging (hidden from production users)
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
