// Answer Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    parent: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true, maxLength: 140 },
    commenter: { type: String, required: true},
    votes: { type: Number, default: 0 }
});


module.exports = mongoose.model("Comment", CommentSchema)
