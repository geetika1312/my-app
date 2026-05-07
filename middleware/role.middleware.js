const { HttpException } = require("../error/HttpException");

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new HttpException(403, "Access denied"));
        }
        next();
    };
};

module.exports = authorizeRoles;