
const router = require("express").Router();
const Question = require("../models/questions");
const User = require("../models/users")
const Tag = require("../models/tags")
const Answer = require("../models/answers");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const { publicKey, verifyOptions } = require("../verify");

router.post("/create", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(401).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { title, summary, text, tags } = req.body

    const tagIds = []
    for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
            tag = new Tag({ name: tagName });
            await tag.save();
        }

        tagIds.push(tag._id);
    }

    console.log(payload)
    const q = new Question({
        title,
        text,
        summary,
        tags: tagIds,
        asked_by: payload?.username
    });

    await q.save();

    res.send(q._id);
});

router.post("/vote", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(401).send("Unauthorized");
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

    const { qid, upvote } = req.body

    if (!mongoose.isValidObjectId(qid)) {
        res.status(400).send("Invalid ID")
        return;
    }

    const q = await Question.findOne({ _id: new mongoose.Types.ObjectId(qid) })
    if (!q) {
        res.status(400).send("Question not found")
        return;
    }
    const owner = await User.findOne({username: q.asked_by})
    if (!owner) {
        res.status(400).send("Owner not found?")
        return;
    }
    owner.reputation += upvote ? 5 : -10;
    await owner.save();

    q.votes += upvote ? 1 : -1;
    await q.save();

    res.status(200).send(q.votes + "");
});

router.get("/q/:id/:incrView?", async (req, res) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).send("Invalid ID")
        return;
    }

    const q = await Question.findOne({ _id: new mongoose.Types.ObjectId(id) })
    const tags = (await Tag.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur.name
        return acc;
    }, {})

    const answers = (await Answer.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc;
    }, {})

    if (req.params.incrView === "true") {
        q.views++;
        await q.save();
    }

    if (q) {
        res.send({
            _id: q._id,
            title: q.title,
            summary: q.summary,
            text: q.text,
            ask_date_time: q.ask_date_time,
            asked_by: q.asked_by,
            tags: q.tags.map(t => tags[t]),
            answers: q.answers.map(a => answers[a]),
            views: q.views,
            votes: q.votes
        })
    } else {
        res.status(404).send("Question not found")
    }
});

router.get("/all/:query?", async (req, res) => {
    const searchStr = req.params.query

    let questions = await Question.find({})
    const tags = (await Tag.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur.name
        return acc;
    }, {})

    const answers = (await Answer.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc;
    }, {})

    if (searchStr) {
        const filterTags = []
        let cur = searchStr;
        while (cur.length > 0) {
            let open = cur.indexOf("[");
            let close = cur.indexOf("]");
    
            if (open === -1 || close === -1) {
                break;
            } else {
                if (open === close + 1) {
                    cur = cur.replace(`[]`, "");
                } else {
                    const tag = cur.substring(open + 1, close);
                    filterTags.push(tag)
                    cur = cur.replace(`[${tag}]`, "");
                }
            }
        }
    
        const keywords = searchStr.split(" ").map(w => w.toLowerCase())
        questions = questions.filter((q) => {
            const titleWords = q.title.split(" ").map(w => w.toLowerCase());
            for (const kw of keywords) {
                if (titleWords.includes(kw))
                    return true;
            }
    
            const textWords = q.text.split(" ").map(w => w.toLowerCase());
            for (const kw of keywords) {
                if (textWords.includes(kw))
                    return true;
            }
    
            const tagNames = q.tags.map((id) => tags[id])
            for (const name of tagNames) {
                if (filterTags.includes(name)) {
                    return true;
                }
            }
    
            return false;
        })
    }
   
    

    if (questions) {
        res.send(questions.map(q => {
            const lastAnswerId = q.answers.length === 0 ? undefined : q.answers[q.answers.length - 1];
            return {
                _id: q._id,
                title: q.title,
                summary: q.summary,
                answersCount: q.answers.length,
                lastAnswerTime: lastAnswerId ? answers[lastAnswerId].ans_date_time : "NONE",
                text: q.text,
                ask_date_time: q.ask_date_time,
                asked_by: q.asked_by,
                tags: q.tags.map(t => tags[t]),
                views: q.views,
                votes: q.votes
            }
        }))
    } else {
        res.status(404).send("No questions found")
    }

});


module.exports = router
