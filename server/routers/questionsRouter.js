
const router = require("express").Router();
const Comment = require("../models/comments");
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
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { title, summary, text, tags } = req.body

    let user;
    if (!payload || !payload.userId || !mongoose.isValidObjectId(payload.userId)
        || !(user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) }))) {

        res.status(400).send("User not found")
        return;
    }


    const tagIds = []
    for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
            if (user.reputation < 50) {
                res.status(400).send(`Reputation (${user.reputation}) is not high enough to create a new tag '${tagName}'`)
                return;
            }
            tag = new Tag({ name: tagName, creator: user._id });
            await tag.save();
        }

        tagIds.push(tag._id);
    }

    const q = new Question({
        title,
        text,
        summary,
        tags: tagIds,
        asked_by: user._id
    });

    await q.save();

    res.status(200).send(q._id);
});


router.post("/edit", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { qid, title, summary, text, tags } = req.body

    let user;
    if (!payload || !payload.userId || !mongoose.isValidObjectId(payload.userId)
        || !(user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) }))) {

        res.status(400).send("User not found")
        return;
    }

    const question = await Question.findOne({ _id: qid });
    if (!question) {
        res.status(400).send("Question not found")
        return;
    }

    if (!question.asked_by.equals(user._id) && !user.isAdmin) {
        res.status(400).send("User does not own this question")
        return;
    }


    question.title = title;
    question.summary = summary;
    question.text = text;

    const tagIds = []
    for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
            if (user.reputation < 50) {
                res.status(400).send(`Reputation (${user.reputation}) is not high enough to create a new tag '${tagName}'`)
                return;
            }
            tag = new Tag({ name: tagName, creator: user.username });
            await tag.save();
        }

        tagIds.push(tag._id);
    }

    question.tags = tagIds;

    await question.save();

    res.status(200).send("Success");
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
    const owner = await User.findOne({ _id: q.asked_by })
    if (owner) {
        owner.reputation += upvote ? 5 : -10;
        await owner.save();
    }

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

    const comments = await Comment.find({});

    const users = (await User.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc;
    }, {})

    const answers = (await Answer.find({})).reduce((acc, cur) => {
        const obj = cur.toObject();
        obj.comments = comments.filter((c) => c.parent.equals(cur._id));
        obj.ans_by = users[obj.ans_by]?.username ?? "Deleted User";
        acc[cur._id] = obj
        return acc;
    }, {})


    if (req.params.incrView === "true") {
        q.views++;
        await q.save();
    }

    const qComments = comments
        .filter((c) => c.parent.equals(q._id))
        .map(c => {
            const obj = c.toObject();

            obj.commenter = users[obj.commenter]?.username ?? "Deleted User";
            return obj;
        });

    const qAnswers = q.answers.map(a => {
        const ans = answers[a]
        ans.comments = ans.comments.map(c => {
            const obj = c.toObject();

            obj.commenter = users[obj.commenter]?.username ?? "Deleted User";
            return obj;
        });

        return ans;
    });

    if (q) {
        res.status(200).send({
            _id: q._id,
            title: q.title,
            summary: q.summary,
            text: q.text,
            ask_date_time: q.ask_date_time,
            asked_by: users[q.asked_by]?.username ?? "Deleted User",
            tags: q.tags.map(t => tags[t]),
            answers: qAnswers,
            comments: qComments,
            views: q.views,
            votes: q.votes
        })
    } else {
        res.status(400).send("Question not found")
    }
});

router.get("/all/:query?", async (req, res) => {
    const searchStr = req.params.query

    let questions = await Question.find({})
    const tags = (await Tag.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur.name
        return acc;
    }, {})

    const users = (await User.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur
        return acc;
    }, {})

    const answers = (await Answer.find({})).reduce((acc, cur) => {
        const obj = cur.toObject();
        obj.ans_by = users[obj.ans_by]?.username ?? "Deleted User"
        acc[obj._id] = obj
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
                answers: q.answers,
                lastAnswerTime: lastAnswerId ? answers[lastAnswerId].ans_date_time : "NONE",
                text: q.text,
                ask_date_time: q.ask_date_time,
                asked_by: users[q.asked_by]?.username ?? "Deleted User",
                tags: q.tags.map(t => tags[t]),
                views: q.views,
                votes: q.votes
            }
        }))
    } else {
        res.status(400).send("No questions found")
    }

});



router.post("/delete", async (req, res) => {
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

    const { qid } = req.body

    if (!mongoose.isValidObjectId(qid)) {
        res.status(400).send("Invalid ID")
        return;
    }

    const q = await Question.findOne({ _id: new mongoose.Types.ObjectId(qid) })
    if (!q) {
        res.status(400).send("Question not found")
        return;
    }


    if (!q.asked_by.equals(user._id) && !user.isAdmin) {
        res.status(400).send("User does not own this question")
        return;
    }

    const aDelRes = await Answer.deleteMany({ question: q._id })
    const cDelRes = await Comment.deleteMany({ parent: q._id })
    const qDelRes = await Question.deleteOne({ _id: q._id })

    console.log(aDelRes)
    console.log(cDelRes)
    console.log(qDelRes)

    res.status(200).send("Deleted")
});


module.exports = router
