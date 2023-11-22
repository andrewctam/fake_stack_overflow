// Answer Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true },
    reputation: { type: Number, default: 0 }
});


module.exports = mongoose.model("User", UserSchema)
