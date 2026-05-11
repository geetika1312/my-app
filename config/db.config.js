const { MongoClient } = require("mongodb");
const logger = require("./logger.config");

let db;

const connectDB = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_URI);

        await client.connect();

        db = client.db(); // uses DB name from URI

        logger.info("MongoDB Connected");

    } catch (error) {
        logger.error(`MongoDB Connection Failed: ${error.message}`, {
            stack: error.stack,
        });

        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized");
    }

    return db;
};

module.exports = {
    connectDB,
    getDB,
};