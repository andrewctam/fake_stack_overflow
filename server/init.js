const args = process.argv.slice(2)
if (args.length < 2) {
    console.log("USAGE: node ./server/init.js <admin_username> <admin_password>");
    return;
}
const username = args[0]
const password = args[1]
const adminEmail = `${username}@fakeso.com`


const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const User = require('./models/users')
const bcrypt = require('bcrypt');

const createAdmin = async () => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = new User({
        username, 
        passwordHash,
        email: adminEmail, 
        isAdmin: true
    });

    if (await User.findOne({
        $or: [{username}, {email: adminEmail}]
    })) {
        console.log("ERROR: User with this username already exists");
        await db.close();
        return;
    }

    await admin.save();

    console.log(`ADMIN CREATED:
    Email: ${adminEmail}
    Username: ${username}
    Password: ${password}`);

    await db.close();
}

createAdmin();

