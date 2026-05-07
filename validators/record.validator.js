const Joi = require("joi");

function validateRecord(object) {
    return Joi.object({
        title: Joi.string().min(3).required().messages({
            "string.empty": "Title is required",
            "string.min": "Title must be at least 3 characters",
        }),

        description: Joi.string().min(5).required().messages({
            "string.empty": "Description is required",
            "string.min": "Description must be at least 5 characters",
        }),
    }).validate(object);
}

module.exports = {
    validateRecord,
};