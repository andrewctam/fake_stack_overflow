// Answer Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true },
    join_date: { type: Date, default: Date.now },
    reputation: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false }
});


module.exports = mongoose.model("User", UserSchema)
