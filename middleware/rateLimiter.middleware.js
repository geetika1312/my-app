const { redisClient } = require("../config/redis.config");
const { HttpException } = require("../error/HttpException");

const rateLimiter = async (req, res, next) => {
    try {
        const ip = req.ip;

        // Redis Key
        const key = `rate_limit:${ip}`;

        // Current requests
        const requests = await redisClient.incr(key);

        // First request → set expiry
        if (requests === 1) {
            await redisClient.expire(key, 60); // 60 seconds
        }

        // Limit check
        if (requests > 10) {
            return next(
                new HttpException(
                    429,
                    "Too many requests. Please try again later."
                )
            );
        }

        next();

    } catch (err) {
        next(err);
    }
};

module.exports = rateLimiter;