const router = require("express").Router();
const User = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Comment = require("../models/comments");
const Tag = require("../models/tags");
const mongoose = require("mongoose");
const { privateKey, signOptions, publicKey, verifyOptions } = require('../verify');

router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        res.status(400).send("Error");
        return;
    }

    if (!email.match(/^\S+@\S+\.\S+$/)) {
        res.status(400).send("Invalid email");
        return;
    }

    if (password.includes(username)) {
        res.status(400).send("Password includes username");
        return;
    }

    const at = email.indexOf("@")
    if (at < 0 || password.substring(0, at).includes(email)) {
        res.status(400).send("Password includes email");
        return;
    }

    const existingUser = await User.findOne({
        $or: [{ username: username }, { email: email }]
    })

    if (existingUser) {
        res.status(400).send("Username already taken");
        return;
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        username, passwordHash, email
    });

    await user.save();

    const token = jwt.sign({ email, username, userId: user._id }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
        .status(200).send(user._id)
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("Missing fields");
        return;
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(400).send("Account with this email was not found");
        return;
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(400).send("Password incorrect");
    }

    const token = jwt.sign({ email, username: user.username, userId: user._id }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
        .status(200).send(user._id)
})

router.post("/logout", async (req, res) => {
    res.cookie('token', "", {
        httpOnly: true, sameSite: 'lax'
    })
    .status(200).send("Logged out")
})

router.get("/profile/:userId", async (req, res) => {
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
    if (!req.params.userId || !mongoose.isValidObjectId(req.params.userId)) {
        res.status(400).send("Invalid userId");
        return;
    }
    const pfUserId = new mongoose.Types.ObjectId(req.params.userId);

    if (user.isAdmin) {
        // user is not the profile in question
        user = await User.findOne({ _id: pfUserId });

        if (!user) {
            res.status(400).send("User not found");
            return;
        }

    } else if (!user._id.equals(pfUserId)) {
        res.status(400).send("Unauthorized");
        return;
    }

    if (user.isAdmin) {
        const users = await User.find({});
        res.status(200).send({
            username: user.username,
            reputation: user.reputation,
            joinDate: user.join_date,
            isAdmin: true,
            users: users.map(u => ({
                username: u.username,
                userId: u._id
            })),
        });
        return;
    }

    const tags = (await Tag.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur.name
        return acc;
    }, {})

    const questions = (await Question.find({
        asked_by: user._id
    }))
        .map((q) => ({
            ...(q.toObject()),
            tags: q.tags.map(tid => tags[tid])
        }))

    const qIds = (await Answer.find({ ans_by: user._id }))
        .map(a => a.question);
    const questionsAnswered = await Question.find({
        _id: { $in: qIds }
    })

    const userTags = await Tag.find({
        creator: user._id
    })


    const allQuestions = await Question.find({});

    const counts = userTags.reduce((acc, cur) => {
        acc[cur._id] = 0
        return acc;
    }, {})

    allQuestions.forEach((q) => {
        q.tags.forEach((tagId) => {
            if (tagId in counts)
                counts[tagId]++;
        })
    })


    res.status(200).send({
        isAdmin: false,
        username: user.username,
        reputation: user.reputation,
        joinDate: user.join_date,
        questions,
        questionsAnswered,
        tags: userTags.map((t) => {
            return {
                _id: t._id,
                name: t.name,
                creator: t.creator,
                count: counts[t._id]
            }
        })
    })
})


router.post("/delete", async (req, res) => {
    const token = req.cookies?.token
    if (!token || !jwt.verify(token, publicKey, verifyOptions)) {
        res.status(400).send("Unauthorized");
        return;
    }
    const payload = jwt.decode(token);

    const { userIdDelete } = req.body;

    if (!userIdDelete || !payload || !payload.userId || !mongoose.isValidObjectId(userIdDelete) || !mongoose.isValidObjectId(payload.userId)) {
        res.status(400).send("Missing params");
        return;
    }

    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(payload.userId) });
    if (!user || !user.isAdmin) {
        res.status(400).send("User not authorized");
        return;
    }

    const userId = new mongoose.Types.ObjectId(userIdDelete);
    const questionsByUser = await Question.find({ asked_by: userId });
    for (const q of questionsByUser) {
        for (const a of q.answers) {
            await Comment.deleteMany({ parent: a._id })
        }

        await Answer.deleteMany({ question: q._id });        
        await Comment.deleteMany({ parent: q._id });
    }
    
    await Question.deleteMany({ asked_by: userId });
    await Answer.deleteMany({ ans_by: userId });
    await Comment.deleteMany({ creator: userId });

    const tagsByUser = await Tag.find({ creator: userId });
    for (const t of tagsByUser) {
        const questionsInUse = await Question.find({
            tags: t._id
        })

        if (questionsInUse.some((e) => !e.asked_by.equals(userId))) {
            continue;
        } else {
            await Tag.deleteOne({ _id: t._id });
        }
    }


    await User.deleteOne({ _id: userIdDelete });
    res.status(200).send("Specified user deleted");
})

module.exports = router