const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db.config");
const User = require("../models/user.models");

//  Import Winston logger
const logger = require("../config/logger");

const seedSuperAdmin = async () => {
    try {
        await connectDB();
        logger.info(" Database connected for seeding");

        const existingAdmin = await User.findOne({
            email: process.env.SUPER_ADMIN_EMAIL,
        });

        if (existingAdmin) {
            logger.warn(" Super admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            process.env.SUPER_ADMIN_PASSWORD,
            10
        );

        const superAdmin = await User.create({
            name: "Super Admin",
            email: process.env.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: "superadmin",
        });

        logger.info(` Super Admin Created: ${superAdmin.email}`);
        process.exit(0);

    } catch (error) {
        logger.error("❌ Seeder error:", error);
        process.exit(1);
    }
};

seedSuperAdmin();