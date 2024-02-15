const express = require('express');


const router = express.Router();
const auth = require('../middlewares/auth');
const Task = require('../models/Task');

router.get('/test',auth, (req, res) => {
    res.json({
        message: "Task routes are working!",
        user: req.user
    });
});

//CRUD tasks

// Create a task
router.post('/', auth, async (req, res) => {
    try {
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            priority: req.body.priority,
            due_date: req.body.due_date,
            owner: req.user._id
        });
        await task.save();
        res.status(201).json({ task, message: "Task Created Successfully!" });
    } catch (err) {
        res.status(400).send({ error: err });
    }
});


// get user tasks
router.get('/', auth, async(req, res) => {
    try{
        const tasks = await Task.find({
            owner: req.user._id
        })
        res.status(200).json({tasks, count: tasks.length, message: "Tasks Fetched Successfuly"});
    }
    catch(err){
        res.status(500).send({error: err});
    }
});

// Fetch a task by id
router.get('/:id', auth, async (req, res) => {
    const taskid = req.params.id;


    try {
        const task = await Task.findOne({ _id: taskid, owner: req.user._id }).select('title description due_date priority category created_date');
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ task, message: "Task Fetched Successfully" });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

module.exports = router;