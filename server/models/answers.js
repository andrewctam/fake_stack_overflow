// Answer Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    text: { type: String, required: true },
    ans_by: { type: Schema.Types.ObjectId, ref: "User" },
    ans_date_time: { type: Date, default: Date.now },
    question: { type: Schema.Types.ObjectId, ref: "Question" },
    votes: { type: Number, default: 0 }
});

module.exports = mongoose.model("Answer", AnswerSchema)
