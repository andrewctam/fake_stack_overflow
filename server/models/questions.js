// Question Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    title: { type: String, required: true, maxLength: 50 },
    summary: { type: String, required: true, maxLength: 140 },
    text: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", required: true }],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
    asked_by: { type: String, default: "Anonymous" },
    ask_date_time: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
});

QuestionSchema.virtual("url").get(() => {
    return `posts/question/${this._id}`
});

module.exports = mongoose.model("Question", QuestionSchema)
