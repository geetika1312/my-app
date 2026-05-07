const { createClient } = require("redis");
const logger = require("./logger.config");

// SINGLE SOURCE OF TRUTH
const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
};

// Cache client (node-redis)
const redisClient = createClient({
    url: `redis://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
});

// Events
redisClient.on("error", (err) => {
    logger.error(` Redis Error: ${err.message}`, {
        stack: err.stack,
    });
});

redisClient.on("connect", () => {
    logger.info(" Connecting to Redis...");
});

redisClient.on("ready", () => {
    logger.info("Redis Ready");
});

// Connect function
const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            logger.info("Redis Connected");
        }
    } catch (err) {
        logger.error(` Redis Connection Failed: ${err.message}`, {
            stack: err.stack,
        });
    }
};

// Export BOTH client + config
module.exports = {
    redisClient,        
    connectRedis,
    REDIS_CONFIG,       
};