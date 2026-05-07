const logger = require("../config/logger.config");
const { HttpException } = require("../error/HttpException");

const {
    getAllUsersService,
    createAdminService,
    createUserService,
} = require("../services/admin.service");

//  GET all users
const getAllUsers = async (req, res, next) => {
    try {
        const result = await getAllUsersService();

        if (result.source === "cache") {
            logger.info("⚡ Users fetched from Redis");
        } else {
            logger.info(" Users fetched from DB and cached");
        }

        res.status(200).json(result.data);

    } catch (err) {
        logger.error(` Error fetching users: ${err.message}`);
        next(new HttpException(500, err.message));
    }
};

// ➕ Create Admin
const createAdmin = async (req, res, next) => {
    try {
        const admin = await createAdminService(req.body);

        logger.info(` Cache cleared & admin created: ${admin.email}`);
        logger.info(` Admin email job added: ${admin.email}`);

        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            admin,
        });

    } catch (err) {
        logger.error(` Error creating admin: ${err.message}`);
        next(err);
    }
};

// Create User
const createUser = async (req, res, next) => {
    try {
        const user = await createUserService(req.body);

        logger.info(` Cache cleared & user created: ${user.email}`);
        logger.info(` Welcome email job added: ${user.email}`);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user,
        });

    } catch (err) {
        logger.error(` Error creating user: ${err.message}`);
        next(err);
    }
};

module.exports = {
    getAllUsers,
    createAdmin,
    createUser,
};