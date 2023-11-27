const args = process.argv.slice(2)
if (args.length < 2) {
    console.log("USAGE: node ./server/init.js <admin_username> <admin_password>");
    return;
}
const adminUsername = args[0]
const adminPassword = args[1]


const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const User = require('./models/users')
const Question = require('./models/questions')
const Tag = require('./models/tags')
const Answer = require('./models/answers')
const Comment = require('./models/comments')

const bcrypt = require('bcrypt');

const createUser = async (username, password, isAdmin = false, reputation = 0) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    const email = `${username}@fakeso.com`

    const user = new User({
        username,
        passwordHash,
        email,
        isAdmin,
        reputation
    });

    if (await User.findOne({
        $or: [{ username }, { email: email }]
    })) {
        console.log(`ERROR: User ${username} already exists`);
        return;
    }

    await user.save();

    console.log(`${isAdmin ? "Admin" : "User"} ${username} created. Email: ${email}, Password: ${password}, Reputation: ${reputation}`);
    return user;
}


const createPost = async (user, title, summary, text, tags) => {
    let tagIds = [];
    for (const tagName of tags) {
        const tag = new Tag({ name: tagName, creator: user._id });
        await tag.save();
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
    console.log(`Post '${title}' created by ${user.username}`)
    return q;
}
const clear = async () => {
    await User.deleteMany({});
    await Tag.deleteMany({});
    await Answer.deleteMany({});
    await Comment.deleteMany({});
    await Question.deleteMany({});

    console.log("Cleared DB");
}


const init = async () => {
    await clear();

    await createUser(adminUsername, adminPassword, true, 0);

    const username1 = adminUsername === "andrew" ? "androo" : "andrew";
    const password1 = "pass1"
    const user1 = await createUser(username1, password1, false, 100)

    const username2 = adminUsername === "bob" ? "bobby" : "bob";
    const password2 = "pass2"
    await createUser(username2, password2, false, 0)

    const username3 = adminUsername === "carl" ? "carol" : "carl";
    const password3 = "pass3"
    await createUser(username3, password3, false, 50)

    await createPost(
        user1,
        "First post on Fake Stack Overflow",
        "This is the summary",
        "This is the text body",
        ["tag1", "tag2", "tag3"]
    );

    await db.close();
}

init();
