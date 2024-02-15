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

// Update a task by id
router.patch('/:id', auth, async (req, res) => {
    const taskid = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'category', 'priority', 'due_date', 'completed', 'status'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: "Invalid Updates" });
    }

    try {
        const task = await Task.findOne({ _id: taskid, owner: req.user._id });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.json({
            message: "Task Updated Successfully",
        });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

// Delete a task by id
router.delete('/:id', auth, async (req, res) => {
    const taskid = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id: taskid, owner: req.user._id });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ task, message: "Task Deleted Successfully" });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

// Share a task with another user
router.patch('/:id/share/:userId', auth, async (req, res) => {
    const taskid = req.params.id;
    const userIdToShareWith = req.params.userId;

    try {
        const task = await Task.findById(taskid);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to share this task" });
        }

        task.shared_with.push(userIdToShareWith);
        await task.save();

        res.json({
            message: "Task Shared Successfully",
        });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

// Set a reminder for a task
router.patch('/:id/set-reminder', auth, async (req, res) => {
    const taskid = req.params.id;
    const reminderTime = req.body.reminder;

    try {
        const task = await Task.findById(taskid);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to set a reminder for this task" });
        }

        task.reminder = reminderTime;
        await task.save();

        res.json({
            message: "Reminder Set Successfully",
        });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

module.exports = router;