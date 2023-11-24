// Tag Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
})


module.exports = mongoose.model("Tag", TagSchema);
