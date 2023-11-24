const router = require("express").Router();
const Comment = require('../models/comments')
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const Question = require("../models/questions");
const Answer = require("../models/answers");
const User = require("../models/users")
const { publicKey, verifyOptions } = require("../verify");

router.get('/:parent', async (req, res) => {
    const parent = req.params.parent;
    if (!mongoose.isValidObjectId(parent)) {
        res.status(400).send("Invalid parent id");
        return;
    }

    const comments = await Comment.find({ parent: new mongoose.Types.ObjectId(parent) });
    res.status(200).send(comments);
});

router.post('/create', async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { parent, parentType, text } = req.body

    if (!parent || (parentType !== "Answer" && parentType !== "Question") || !text) {
        res.status(400).send("Error with parameters");
        return;
    }

    if (text.length > 140) {
        res.status(400).send("Text too long");
        return;
    }
    let user;
    if (!payload || !payload.userId || !mongoose.isValidObjectId(payload.userId)
        || !(user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) }))) {

        res.status(400).send("User not found")
        return;
    }

    if (user.reputation < 50) {
        res.status(400).send(`Reputation (${user.reputation}) not high enough.`)
        return;
    }

    if (parentType === "Answer") {
        if (!(await Answer.findOne({ _id: parent }))) {
            res.status(400).send("Answer not found")
            return;
        }
    } else if (parentType === "Question") {
        if (!(await Question.findOne({ _id: parent }))) {
            res.status(400).send("Question not found")
            return;
        }
    } else {
        res.status(400).send("???")
        return;
    }

    const comment = new Comment({
        parent, text, commenter: user._id
    })

    await comment.save();

    const c = comment.toObject();
    c.commenter = user.username;

    res.status(200).send(c);

});


router.post("/vote", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    let user;
    if (!payload || !payload.userId || !mongoose.isValidObjectId(payload.userId)
        || !(user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) }))) {

        res.status(400).send("User not found")
        return;
    }

    const { commentId } = req.body

    if (!mongoose.isValidObjectId(commentId)) {
        res.status(400).send("Invalid ID")
        return;
    }

    const comment = await Comment.findOne({ _id: new mongoose.Types.ObjectId(commentId) })
    if (!comment) {
        res.status(400).send("Question not found")
        return;
    }

    comment.votes++;
    await comment.save();

    res.status(200).send(comment.votes + "");
});


module.exports = router
