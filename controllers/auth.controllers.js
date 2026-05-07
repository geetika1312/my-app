const authService = require("../services/auth.service");
const {
    validateRegister,
    validateLogin,
} = require("../validators/user.validator");

const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorCodes");
const logger = require("../config/logger.config"); 

const register = async (req, res, next) => {
    try {
        const { error } = validateRegister(req.body);
        if (error) {
            logger.warn(` Register validation failed: ${error.details[0].message}`);
            throw new HttpException(
                errorType.BAD_REQUEST.status,
                error.details[0].message
            );
        }

        await authService.registerUser(req.body);

        logger.info(` User registered: ${req.body.email}`);

        res.status(200).json({
            success: true,
            message: "User registered successfully",
        });

    } catch (err) {
        logger.error(` Register error: ${err.message}`, {
            stack: err.stack,
        });
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        //  Joi validation
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn(` Login validation failed: ${error.details[0].message}`);
            throw new HttpException(
                errorType.BAD_REQUEST.status,
                error.details[0].message
            );
        }

        const data = await authService.loginUser(req.body);

        logger.info(` Login success: ${req.body.email}`);

        res.status(200).json({
            success: true,
            message: "Login successful",
            ...data,
        });

    } catch (err) {
        logger.error(` Login error: ${err.message}`, {
            stack: err.stack,
        });
        next(err);
    }
};

module.exports = {
    register,
    login,
};