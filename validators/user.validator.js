const Joi = require("joi");

//  REGISTER VALIDATION
function validateRegister(object) {
    return Joi.object({
        name: Joi.string().min(3).max(30).required().messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 3 characters",
            "string.max": "Name must not exceed 30 characters",
        }),

        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
        }),

        password: Joi.string()
            .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
            .min(6)
            .required()
            .messages({
                "string.empty": "Password is required",
                "string.min": "Password must be at least 6 characters",
                "string.pattern.base":
                    "Password must contain at least one letter, one number, and one special character",
            }),
    }).validate(object);
}

//  LOGIN VALIDATION
function validateLogin(object) {
    return Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Invalid email format",
        }),

        password: Joi.string().required().messages({
            "string.empty": "Password is required",
        }),
    }).validate(object);
}

module.exports = {
    validateRegister,
    validateLogin,
};