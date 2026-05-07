const mongoose = require("mongoose");
const logger = require("./logger.config"); // 👈 import winston

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        logger.info("MongoDB Connected");

    } catch (error) {
        logger.error(` MongoDB Connection Failed: ${error.message}`, {
            stack: error.stack,
        });

        process.exit(1);
    }
};

module.exports = connectDB;