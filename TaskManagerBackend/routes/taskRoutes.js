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

//Create a task
router.post('/', auth, async (req, res) => {
    try{
        //description, completed from req.body
        //owner : req.user._id
        const task = new Task({
            ...req.body, 
            owner: req.user._id
        });
        await task.save();
        res.status(201).json({task, message: "Task Created Successfully!"});
    }
    catch(err){
        res.status(400).send({error: err});
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

module.exports = router;