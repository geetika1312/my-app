const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const { redisClient } = require("../config/redis.config");
const { addEmailJob } = require("../queues/email.queues"); 
const { HttpException } = require("../error/HttpException");

const USERS_CACHE_KEY = "users";

//  Get all users
const getAllUsersService = async () => {
    const cacheData = await redisClient.get(USERS_CACHE_KEY);

    if (cacheData) {
        return { source: "cache", data: JSON.parse(cacheData) };
    }

    const users = await User.find().select("-password");

    await redisClient.set(
        USERS_CACHE_KEY,
        JSON.stringify(users),
        { EX: 60 }
    );

    return { source: "db", data: users };
};


//  Create Admin
const createAdminService = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new HttpException(400, "All fields are required");
    }

    const exists = await User.findOne({ email });
    if (exists) {
        throw new HttpException(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
    });

    // Invalidate cache
    await redisClient.del(USERS_CACHE_KEY);

    //  Use common function
    await addEmailJob({
        email: admin.email,
        name: admin.name,
        type: "ADMIN_CREATED",
    });

    return admin;
};


// ➕ Create User
const createUserService = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new HttpException(400, "All fields are required");
    }

    const exists = await User.findOne({ email });
    if (exists) {
        throw new HttpException(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
    });

    // Invalidate cache
    await redisClient.del(USERS_CACHE_KEY);

    // 🔥 Use common function
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