const router = require("express").Router();
const Tag = require('../models/tags');
const Question = require('../models/questions')

router.get('/all', async (req, res) => {
    const tags = await Tag.find({});
    const questions = await Question.find({});
    
    const counts = tags.reduce((acc, cur) => {
        acc[cur._id] = 0
        return acc;
    }, {})

    questions.forEach((q) => {
        q.tags.forEach((tagId) => {
            counts[tagId]++;
        })
    })

    if (tags)
        res.send(tags.map((t) => {
            return {
                name: t.name,
                count: counts[t._id]
            }
        }));
    else
        res.status(404).send("No tags found")
});

module.exports = router
