const router = require("express").Router();
const Tag = require('../models/tags');
const Question = require('../models/questions');
const jwt = require('jsonwebtoken');
const { publicKey, verifyOptions } = require("../verify");
const User = require("../models/users")
const mongoose = require("mongoose");


router.get('/all', async (req, res) => {
    const tags = await Tag.find({});
    const questions = await Question.find({});

    const counts = tags.reduce((acc, cur) => {
        acc[cur._id] = 0
        return acc;
    }, {})

    questions.forEach((q) => {
        q.tags.forEach((tagId) => {
            counts[tagId]++;
        })
    })

    if (tags)
        res.send(tags.map((t) => {
            return {
                name: t.name,
                count: counts[t._id]
            }
        }));
    else
        res.status(400).send("No tags found")
});

router.post("/edit", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { tid, newName } = req.body

    if (!tid || !newName || !payload || !payload.userId || !mongoose.isValidObjectId(payload.userId)) {
        res.status(400).send("Missing params");
        return;
    }
    const tag = await Tag.findOne({ _id: tid });
    if (!tag) {
        res.status(400).send("Tag not found");
        return;
    }

    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) })

    if (!user || (!tag.creator.equals(user._id) && !user.isAdmin)) {
        res.status(400).send("Not the tag creator");
        return;
    }


    const questionsInUse = await Question.find({ asked_by: { $ne: tag.creator }, tags: tid });
    if (questionsInUse.length > 0) {
        res.status(400).send("Tag in use by other users");
        return;
    }

    tag.name = newName;
    await tag.save();

    res.status(200).send("Success");

})


router.post("/delete", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { tid } = req.body
    if (!tid || !payload || !payload.userId || !mongoose.isValidObjectId(payload.userId)) {
        console.log(req.body)
        res.status(400).send("Missing params");
        return;
    }

    const tag = await Tag.findOne({ _id: tid });
    if (!tag) {
        res.status(400).send("Tag not found");
        return;
    }

    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) })

    if (!user || (!tag.creator.equals(user._id) && !user.isAdmin)) {
        res.status(400).send("Not the tag creator");
        return;
    }

    const questionsInUse = await Question.find({ asked_by: { $ne: tag.creator }, tags: tid });
    if (questionsInUse.length > 0) {
        res.status(400).send("Tag in use by other users");
        return;
    }

    await Question.updateMany(
        { tags: tid },
        { $pull: { tags: tid } }
    );

    await Tag.deleteOne({ _id: tid });
    res.status(200).send("Success");
})


module.exports = router
