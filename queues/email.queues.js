const { Queue } = require("bullmq");

const { REDIS_CONFIG } = require("../config/redis.config");

const {
    QUEUE_NAMES,
    JOB_NAMES,
} = require("../constants/queue.constants");

const emailQueue = new Queue(
    QUEUE_NAMES.EMAIL_QUEUE,
    {
        connection: REDIS_CONFIG,
    }
);

const addEmailJob = async ({
    email,
    name,
    type,
}) => {
    return await emailQueue.add(
        JOB_NAMES.SEND_EMAIL,
        {
            email,
            name,
            type,
        },
        {
            attempts: 3,
            backoff: 5000,
        }
    );
};

module.exports = {
    emailQueue,
    addEmailJob,
};