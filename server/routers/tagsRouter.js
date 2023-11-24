const router = require("express").Router();
const Tag = require('../models/tags');
const Question = require('../models/questions');
const jwt = require('jsonwebtoken');
const { publicKey, verifyOptions } = require("../verify");

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
    if (!tid || !newName) {
        console.log(req.body)
        res.status(400).send("Missing params");
        return;
    }
    const tag = await Tag.findOne({ _id: tid });
    if (!tag) {
        res.status(400).send("Tag not found");
        return;
    }

    if (!payload || !payload.username || tag.creator !== payload.username) {
        res.status(400).send("Not the tag creator");
        return;
    }

    const questionsInUse = await Question.find({
        tags: tid
    })

    if (questionsInUse.some((e) => { return e.asked_by !== payload.username})) {
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
    if (!tid) {
        console.log(req.body)
        res.status(400).send("Missing tag id");
        return;
    }
    const tag = await Tag.findOne({ _id: tid });
    if (!tag) {
        res.status(400).send("Tag not found");
        return;
    }

    if (!payload || !payload.username || tag.creator !== payload.username) {
        res.status(400).send("Not the tag creator");
        return;
    }

    const questionsInUse = await Question.find({
        tags: tid
    })

    if (questionsInUse.some((e) => { return e.asked_by !== payload.username})) {
        res.status(400).send("Tag in use by other users");
        return;
    }

    questionsInUse.forEach(async (q) => {
        q.tags.splice(q.tags.indexOf(tid), 1);
        await q.save();
    })
    
    await Tag.deleteOne({ _id: tid });
    res.status(200).send("Success");

})


module.exports = router
