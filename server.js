const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const { connectDB } = require("./config/db.config");
const { connectRedis } = require("./config/redis.config");

const { errorMiddleware } = require("./middleware/error.middleware");
const rateLimiter = require("./middleware/rateLimiter.middleware");

const routes = require("./routes/index");

const logger = require("./config/logger.config");

const app = express();

const startServer = async () => {
    try {
        // MongoDB
        logger.info("Connecting MongoDB...");
        await connectDB();

        // Redis
        logger.info("Connecting Redis...");
        await connectRedis();

        // Start BullMQ Workers
        logger.info("Starting BullMQ Workers...");
        require("./workers");

        // Security Middleware
        app.use(helmet());

        // Middleware
        app.use(cors());
        app.use(express.json());

        // Rate Limiter
        app.use(rateLimiter);

        // Health Route
        app.get("/", (req, res) => {
            res.send("API is running...");
        });

        // Routes
        app.use("/api", routes);

        // Error Middleware
        app.use(errorMiddleware);

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            logger.info(
                `Server running on port ${PORT}`
            );
        });

    } catch (err) {
        logger.error(
            `Server startup failed: ${err.message}`,
            {
                stack: err.stack,
            }
        );

        process.exit(1);
    }
};

startServer();