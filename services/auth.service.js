const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { getDB } = require("../config/db.config");

const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorCodes");

const { addEmailJob } = require("../queues/email.queues");

// Generate Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE,
        }
    );
};

// Register User
const registerUser = async ({ name, email, password }) => {
    const db = getDB();

    const userExists = await db
        .collection("users")
        .findOne({ email });

    if (userExists) {
        throw new HttpException(
            errorType.BAD_REQUEST.status,
            "User already exists"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        name,
        email,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
    };

    const result = await db
        .collection("users")
        .insertOne(newUser);

    const user = {
        _id: result.insertedId,
        ...newUser,
    };

    // Add welcome email job
    await addEmailJob({
        email: user.email,
        name: user.name,
        type: "WELCOME",
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
    };
};

// Login User
const loginUser = async ({ email, password }) => {
    const db = getDB();

    const user = await db
        .collection("users")
        .findOne({ email });

    if (!user) {
        throw new HttpException(
            errorType.UNAUTHORIZED.status,
            "Invalid credentials"
        );
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new HttpException(
            errorType.UNAUTHORIZED.status,
            "Invalid credentials"
        );
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

module.exports = {
    registerUser,
    loginUser,
};