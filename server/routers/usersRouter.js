const router = require("express").Router();
const User = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { privateKey, signOptions } = require('../verify');
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Tag = require("../models/tags");

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

    const token = jwt.sign({ email, username }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
    .status(200).send("Successfully Registered")
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

    if (! (await bcrypt.compare(password, user.passwordHash) )) {
        return res.status(400).send("Password incorrect");
    }
    
    const token = jwt.sign({ email, username }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
    .status(200).send("Successfully Registered")
})

router.get("/profile/:username", async (req, res) => {
    
    const username = req.params.username;

    if (!username) {
        res.status(400).send("Missing username")
    }

    const user = await User.findOne({ username: username });
    if (!user) {
        res.status(400).send("Account with this username was not found");
        return;
    }

    const tags = (await Tag.find({})).reduce((acc, cur) => {
        acc[cur._id] = cur.name
        return acc;
    }, {})

    const questions = (await Question.find({
        asked_by: username
    }))
    .map((q) => ({
        ...(q.toObject()),
        tags: q.tags.map(tid => tags[tid])
    })) 

    const qIds = (await Answer.find({ans_by: username}))
        .map(a => a.question);
    const questionsAnswered = await Question.find({
        _id: {$in: qIds}
    })

    const userTags = await Tag.find({
        creator: username
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

module.exports = router