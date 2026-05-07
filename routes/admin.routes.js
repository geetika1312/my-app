const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
    getAllUsers,
    createAdmin,
    createUser,
} = require("../controllers/admin.controllers");

// routes
router.get("/users", authMiddleware, allowRoles("superadmin", "admin"), getAllUsers);

router.post("/create-admin", authMiddleware, allowRoles("superadmin"), createAdmin);

router.post("/create-user", authMiddleware, allowRoles("admin"), createUser);

module.exports = router;