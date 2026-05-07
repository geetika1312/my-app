const logger = require("../config/logger.config");
const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorCodes");

const {
    getRecordsService,
    createRecordService,
    updateRecordService,
    deleteRecordService,
} = require("../services/record.service");

//  GET all records
const getRecords = async (req, res, next) => {
    try {
        logger.info(" Fetching records");

        const result = await getRecordsService();

        if (result.source === "cache") {
            logger.info("⚡ Records fetched from Redis");
        } else {
            logger.info("Records fetched from DB and cached");
        }

        res.status(200).json(result.data);

    } catch (err) {
        logger.error(` Error fetching records: ${err.message}`, {
            stack: err.stack,
        });

        next(new HttpException(500, err.message));
    }
};

// ➕ CREATE record

const createRecord = async (req, res, next) => {
    try {
        logger.info("Creating new record");

        const record = await createRecordService(req.body);

        logger.info(" Cache cleared (CREATE)");

        res.status(201).json(record);

    } catch (err) {
        logger.error(` Error creating record: ${err.message}`, {
            stack: err.stack,
        });

        next(
            new HttpException(
                errorType.BAD_REQUEST.status,
                err.message
            )
        );
    }
};

// UPDATE record

const updateRecord = async (req, res, next) => {
    try {
        logger.info(` Updating record: ${req.params.id}`);

        const updated = await updateRecordService(
            req.params.id,
            req.body
        );

        logger.info(" Cache cleared (UPDATE)");

        res.status(200).json(updated);

    } catch (err) {
        logger.error(` Error updating record: ${err.message}`, {
            stack: err.stack,
        });

        next(
            err instanceof HttpException
                ? err
                : new HttpException(
                      errorType.INTERNAL_SERVER_ERROR.status,
                      err.message
                  )
        );
    }
};

//  DELETE record

const deleteRecord = async (req, res, next) => {
    try {
        logger.info(`🗑️ Deleting record: ${req.params.id}`);

        await deleteRecordService(req.params.id);

        logger.info(" Cache cleared (DELETE)");

        res.status(200).json({ msg: "Deleted successfully" });

    } catch (err) {
        logger.error(` Error deleting record: ${err.message}`, {
            stack: err.stack,
        });

        next(
            err instanceof HttpException
                ? err
                : new HttpException(
                      errorType.INTERNAL_SERVER_ERROR.status,
                      err.message
                  )
        );
    }
};

module.exports = {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
};