const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const recordRoutes = require("./record.routes");
const adminRoutes = require("./admin.routes");

router.use("/auth", authRoutes);
router.use("/records", recordRoutes);
router.use("/admin", adminRoutes); 

module.exports = router;