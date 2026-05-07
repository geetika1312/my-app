const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    title: String,
    description: String,
}, { timestamps: true });

module.exports = mongoose.model("Record", recordSchema);