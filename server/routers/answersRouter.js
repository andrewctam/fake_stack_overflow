
const router = require("express").Router();
const Answer = require("../models/answers")
const Question = require("../models/questions")

router.post("/create", async (req, res) => {
    const { qid, ans_by, text } = req.body;

    const question = await Question.findOne({ _id: qid });
    if (!question) {
        res.status(404).send("Question not found");
        return;
    }

    const ans = new Answer({
        text,
        ans_by
    })

    await ans.save()
    question.answers.push(ans._id);
    await question.save()

    res.send(ans._id);
})

module.exports = router