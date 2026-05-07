const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorCodes");

const { addEmailJob } = require(
    "../queues/email.queues"
);

// 🔐 Generate Token
const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// 📝 Register user
const registerUser = async ({ name, email, password }) => {
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new HttpException(
            errorType.BAD_REQUEST.status,
            "User already exists"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    // 🔥 ADD TO BULLMQ QUEUE
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

// 🔐 Login user
const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new HttpException(
            errorType.UNAUTHORIZED.status,
            "Invalid credentials"
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);

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
            role: user.role
        },
    };
};

module.exports = {
    registerUser,
    loginUser,
};