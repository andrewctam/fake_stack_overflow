// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/tags", require("./routers/tagsRouter"))
app.use("/answers", require("./routers/answersRouter"))
app.use("/questions", require("./routers/questionsRouter"))
app.use("/users", require("./routers/usersRouter"))

const PORT = 8000;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

process.on("SIGINT", async () => {
    await db.close();

    server.close(() => {
        console.log("Server closed. Database instance disconnected");
    })
})
