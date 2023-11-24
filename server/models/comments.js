// Answer Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    parent: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true, maxLength: 140 },
    commenter: { type: Schema.Types.ObjectId, ref: "User" },
    votes: { type: Number, default: 0 },
    comment_date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Comment", CommentSchema)
