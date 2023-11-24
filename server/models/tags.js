// Tag Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    name: { type: String, required: true },
    creator: { type: String, required: true }
})

TagSchema.virtual("url").get(() => {
    return `posts/tag/${this._id}`
});

module.exports = mongoose.model("Tag", TagSchema);
