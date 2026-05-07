const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db.config");
const { connectRedis } = require("./config/redis.config");
const { errorMiddleware } = require("./middleware/error.middleware");
const routes = require("./routes/index");
const logger = require("./config/logger.config");

const app = express();

const startServer = async () => {
    try {
        // MongoDB
        logger.info(" Connecting MongoDB...");
        await connectDB();

        // Redis
        logger.info(" Connecting Redis...");
        await connectRedis();

        // Start Workers AFTER Redis
        logger.info(" Starting BullMQ Workers...");
        require("./workers");

        // Middleware
        app.use(cors());
        app.use(express.json());

        app.get("/", (req, res) => {
            res.send("API is running...");
        });

        app.use("/api", routes);

        app.use(errorMiddleware);

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            logger.info(
                ` Server running on port ${PORT}`
            );
        });

    } catch (err) {
        logger.error(
            ` Server startup failed: ${err.message}`
        );
    }
};

startServer();