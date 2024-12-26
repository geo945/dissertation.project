const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
        required: true,
        min: 0,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    isMarried: {
        type: Boolean,
        required: true,
    },
    addresses: {
        type: [addressSchema], // Array of nested address objects
        required: true,
    },
});

module.exports = mongoose.model("User", userSchema);
