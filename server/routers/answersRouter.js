
const router = require("express").Router();
const Answer = require("../models/answers")
const User = require("../models/users")
const Question = require("../models/questions")
const jwt = require('jsonwebtoken');
const { publicKey, verifyOptions } = require("../verify");
const { default: mongoose } = require("mongoose");

router.post("/create", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { qid, text } = req.body;

    let user;
    if (!payload || !payload.username || !(user = await User.findOne({ username: payload.username }))) {
        res.status(400).send("User not found")
        return;
    }
    
    const question = await Question.findOne({ _id: qid });
    if (!question) {
        res.status(400).send("Question not found");
        return;
    }

    const ans = new Answer({
        question: qid,
        text,
        ans_by: payload.username
    })

    await ans.save()
    question.answers.push(ans._id);
    await question.save()

    res.send(ans._id);
})


router.post("/vote", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    let user;
    if (!payload || !payload.username || !(user = await User.findOne({username: payload.username}))) {
        res.status(400).send("User not found")
        return;
    }
    if (user.reputation < 50) {
        res.status(400).send(`Reputation (${user.reputation}) not high enough.`)
        return;
    }

    const { aid, upvote } = req.body

    if (!mongoose.isValidObjectId(aid)) {
        res.status(400).send("Invalid ID")
        return;
    }

    const ans = await Answer.findOne({ _id: new mongoose.Types.ObjectId(aid) })
    if (!ans) {
        res.status(400).send("Question not found")
        return;
    }
    const owner = await User.findOne({username: ans.ans_by})
    if (!owner) {
        res.status(400).send("Owner not found?")
        return;
    }
    owner.reputation += upvote ? 5 : -10;
    await owner.save();

    ans.votes += upvote ? 1 : -1;
    await ans.save();

    res.status(200).send(ans.votes + "");
});

module.exports = router