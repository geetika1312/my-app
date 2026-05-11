const bcrypt = require("bcryptjs");

const { getDB } = require("../config/db.config");
const { redisClient } = require("../config/redis.config");
const { addEmailJob } = require("../queues/email.queues");
const { HttpException } = require("../error/HttpException");

const USERS_CACHE_KEY = "users";

// Get all users
const getAllUsersService = async () => {
    const cacheData = await redisClient.get(USERS_CACHE_KEY);

    if (cacheData) {
        return {
            source: "cache",
            data: JSON.parse(cacheData),
        };
    }

    const db = getDB();

    const users = await db
        .collection("users")
        .find({}, { projection: { password: 0 } })
        .toArray();

    await redisClient.set(
        USERS_CACHE_KEY,
        JSON.stringify(users),
        { EX: 60 }
    );

    return {
        source: "db",
        data: users,
    };
};

// Create Admin
const createAdminService = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new HttpException(400, "All fields are required");
    }

    const db = getDB();

    const exists = await db.collection("users").findOne({ email });

    if (exists) {
        throw new HttpException(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = {
        name,
        email,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newAdmin);

    const admin = {
        _id: result.insertedId,
        ...newAdmin,
    };

    // Invalidate cache
    await redisClient.del(USERS_CACHE_KEY);

    // Add email job
    await addEmailJob({
        email: admin.email,
        name: admin.name,
        type: "ADMIN_CREATED",
    });

    return admin;
};

// Create User
const createUserService = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new HttpException(400, "All fields are required");
    }

    const db = getDB();

    const exists = await db.collection("users").findOne({ email });

    if (exists) {
        throw new HttpException(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        name,
        email,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    const user = {
        _id: result.insertedId,
        ...newUser,
    };

    // Invalidate cache
    await redisClient.del(USERS_CACHE_KEY);

    // Add email job
    await addEmailJob({
        email: user.email,
        name: user.name,
        type: "WELCOME",
    });

    return user;
};

module.exports = {
    getAllUsersService,
    createAdminService,
    createUserService,
};