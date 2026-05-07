const express = require("express");
const router = express.Router();
const User = require("../models/user.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/auth.controllers");

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;