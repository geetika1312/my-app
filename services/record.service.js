const Record = require("../models/record.models");
const { redisClient } = require("../config/redis.config");
const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorCodes");

const RECORDS_CACHE_KEY = "records";

// 📥 GET all records
const getRecordsService = async () => {
    const cacheData = await redisClient.get(RECORDS_CACHE_KEY);

    if (cacheData) {
        return { source: "cache", data: JSON.parse(cacheData) };
    }

    const records = await Record.find();

    await redisClient.set(
        RECORDS_CACHE_KEY,
        JSON.stringify(records),
        { EX: 60 }
    );

    return { source: "db", data: records };
};

// ➕ CREATE record
const createRecordService = async (body) => {
    const record = await Record.create(body);

    await redisClient.del(RECORDS_CACHE_KEY);

    return record;
};

// ✏️ UPDATE record
const updateRecordService = async (id, body) => {
    const updated = await Record.findByIdAndUpdate(
        id,
        body,
        { new: true }
    );

    if (!updated) {
        throw new HttpException(
            errorType.NOT_FOUND.status,
            "Record not found"
        );
    }

    await redisClient.del(RECORDS_CACHE_KEY);

    return updated;
};

// ❌ DELETE record
const deleteRecordService = async (id) => {
    const deleted = await Record.findByIdAndDelete(id);

    if (!deleted) {
        throw new HttpException(
            errorType.NOT_FOUND.status,
            "Record not found"
        );
    }

    await redisClient.del(RECORDS_CACHE_KEY);

    return true;
};

module.exports = {
    getRecordsService,
    createRecordService,
    updateRecordService,
    deleteRecordService,
};