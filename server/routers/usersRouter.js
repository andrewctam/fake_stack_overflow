const router = require("express").Router();
const User = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Question = require("../models/questions");
const Answer = require("../models/answers");
const Tag = require("../models/tags");
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

    const token = jwt.sign({ email, username }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
        .status(200).send(user.username)
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

    const token = jwt.sign({ email, username: user.username }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
        .status(200).send(user.username)
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

    if (user.isAdmin) {
        const users = await User.find({});
        res.status(200).send({
            username: user.username,
            reputation: user.reputation,
            joinDate: user.join_date,
            isAdmin: true,
            users: users.map(u => u.username),
        });
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

    const qIds = (await Answer.find({ ans_by: username }))
        .map(a => a.question);
    const questionsAnswered = await Question.find({
        _id: { $in: qIds }
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

    const { username } = req.body;

    if (!username || !payload || !payload.username) {
        res.status(400).send("Missing params");
        return;
    }

    const user = await User.findOne({ username: payload.username });

    if (!user || !user.isAdmin) {
        res.status(400).send("User not authorized");
        return;
    }

    await User.deleteOne({ username });
    res.status(200).send("Specified user deleted");
})

module.exports = router