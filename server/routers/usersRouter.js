const router = require("express").Router();
const User = require('../models/users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { privateKey, signOptions } = require('../verify')

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
        res.status(401).send("Missing fields");
        return;
    }
    const user = await User.findOne({ email: email });
    if (!user) {
        res.status(401).send("Account with this email was not found");
        return;
    }

    if (! (await bcrypt.compare(password, user.passwordHash) )) {
        return res.status(401).send("Password incorrect");
    }
    
    const token = jwt.sign({ email, username }, privateKey, signOptions);
    res.cookie('token', token, {
        httpOnly: true, sameSite: 'lax'
    })
    .status(200).send("Successfully Registered")
})

module.exports = router