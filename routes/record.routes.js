const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/record.controllers");

// Protected routes
router.get("/", authMiddleware, getRecords);
router.post("/", authMiddleware, createRecord);
router.put("/:id", authMiddleware, updateRecord);
router.delete("/:id", authMiddleware, deleteRecord);

module.exports = router;