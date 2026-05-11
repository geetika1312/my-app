const { ObjectId } = require("mongodb");

const { getDB } = require("../config/db.config");
const { redisClient } = require("../config/redis.config");

const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorCodes");

const RECORDS_CACHE_KEY = "records";

// GET all records
const getRecordsService = async () => {
    const cacheData = await redisClient.get(RECORDS_CACHE_KEY);

    if (cacheData) {
        return {
            source: "cache",
            data: JSON.parse(cacheData),
        };
    }

    const db = getDB();

    const records = await db
        .collection("records")
        .find()
        .toArray();

    await redisClient.set(
        RECORDS_CACHE_KEY,
        JSON.stringify(records),
        { EX: 60 }
    );

    return {
        source: "db",
        data: records,
    };
};

// CREATE record
const createRecordService = async (body) => {
    const db = getDB();

    const newRecord = {
        ...body,
        createdAt: new Date(),
    };

    const result = await db
        .collection("records")
        .insertOne(newRecord);

    const record = {
        _id: result.insertedId,
        ...newRecord,
    };

    await redisClient.del(RECORDS_CACHE_KEY);

    return record;
};

// UPDATE record
const updateRecordService = async (id, body) => {
    const db = getDB();

    const result = await db
        .collection("records")
        .findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...body,
                    updatedAt: new Date(),
                },
            },
            {
                returnDocument: "after",
            }
        );

    if (!result) {
        throw new HttpException(
            errorType.NOT_FOUND.status,
            "Record not found"
        );
    }

    await redisClient.del(RECORDS_CACHE_KEY);

    return result;
};

// DELETE record
const deleteRecordService = async (id) => {
    const db = getDB();

    const result = await db
        .collection("records")
        .deleteOne({
            _id: new ObjectId(id),
        });

    if (result.deletedCount === 0) {
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