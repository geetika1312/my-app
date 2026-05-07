const { Worker } = require("bullmq");

const logger = require("../config/logger.config");

const {
    REDIS_CONFIG,
    redisClient,
} = require("../config/redis.config");

const {
    QUEUE_NAMES,
    JOB_TYPES,
} = require("../constants/queue.constants");

logger.info(" Email Worker started");

const emailWorker = new Worker(
    QUEUE_NAMES.EMAIL_QUEUE,

    async (job) => {
        const { email, name, type } = job.data;

        if (type === JOB_TYPES.WELCOME) {
            logger.info(
                ` Welcome email for ${name}`
            );
        }

        if (type === JOB_TYPES.ADMIN_CREATED) {
            logger.info(
                ` Admin created for ${name}`
            );
        }

        const counter = await redisClient.incr(
            "job_counter"
        );

        logger.info(
            ` Job processed | Counter: ${counter}`
        );
    },

    {
        connection: REDIS_CONFIG,
    }
);

emailWorker.on("completed", (job) => {
    logger.info(
        ` Job completed: ${job.id}`
    );
});

emailWorker.on("failed", (job, err) => {
    logger.error(
        ` Job failed: ${job?.id} - ${err.message}`
    );
});

module.exports = emailWorker;