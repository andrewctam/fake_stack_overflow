// Answer Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    text: { type: String, required: true },
    ans_by: { type: String, required: true },
    ans_date_time: { type: Date, default: Date.now }
});

AnswerSchema.virtual("url").get(() => {
    return `posts/answer/${this._id}`
});

module.exports = mongoose.model("Answer", AnswerSchema)
