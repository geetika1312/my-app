const logger = require("../config/logger"); // 👈 your winston logger

const catchUnhandledError = () => {

  // Uncaught Exceptions (sync errors)
  process.on("uncaughtException", (err) => {
    logger.error(" Uncaught Exception:", {
      message: err.message,
      stack: err.stack,
    });

    // Optional: exit process (recommended in production)
    process.exit(1);
  });

  // Unhandled Promise Rejections (async errors)
  process.on("unhandledRejection", (reason) => {
    logger.error(" Unhandled Rejection:", {
      message: reason?.message || reason,
      stack: reason?.stack || null,
    });

    process.exit(1);
  });

  // Node warnings
  process.on("warning", (warning) => {
    logger.warn(" Node Warning:", {
      message: warning.message,
      stack: warning.stack,
    });
  });
};

module.exports = { catchUnhandledError };