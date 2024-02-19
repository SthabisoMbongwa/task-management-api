// userRoutes.js
const express = require('express');
const User = require('../models/User.js');
const Task = require('../models/Task.js'); // Import the Task model
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth'); // Import the auth middleware


router.get('/', (req, res) => {
    res.send("User routes are working!");
})

// Update user role
router.patch('/:id/role', auth, async (req, res) => {
    const userId = req.params.id;
    const newRole = req.body.role;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: "User is already an admin" });
        }

        user.role = newRole;
        await user.save();

        res.status(200).json({ user, message: "User role updated successfully" });
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).send({ user , message : "User Created Successfully"});
    } catch (err) {
        res.status(400).send({ error: err})
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(!user){
            throw new Error("Unable to login, invalid credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            throw new Error("Unable to login, invalid credentials");
        }
        const token = jwt.sign({
            _id: user._id.toString()
        }, process.env.JWT_SECRET_KEY );

        res.send({ user, token, message: "Logged in successfully" });
    } catch(err){
        res.status(400).send({ error: err});
    }
});

router.get('/all', auth, async (req, res) => {
    try {
        const users = await User.find();
        const userData = await Promise.all(users.map(async (user) => {
            const taskCount = await Task.countDocuments({ owner: user._id });
            return {
                id: user._id,
                email: user.email,
                tasks: taskCount,
                registrationDate: user.createdAt,
                status: user.status
            };
        }));
        res.status(200).json({ userData, message: "Users Fetched Successfully" });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


router.patch('/:id/status', auth, async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const lastUpdatedTask = await Task.findOne({ owner: userId }).sort({ updatedAt: -1 });
        const lastUpdatedDate = lastUpdatedTask ? lastUpdatedTask.updatedAt : user.createdAt;
        const oneMonthAgo = new Date(Date.now() -   30 *   24 *   60 *   60 *   1000);

        if (lastUpdatedDate < oneMonthAgo) {
            user.status = 'Inactive';
            await user.save();
            res.status(200).json({ user, message: "User status updated to Inactive" });
        } else {
            res.status(200).json({ user, message: "User is still active" });
        }
    } catch (err) {
        res.status(500).send({ error: err });
    }
});

// Export the router
module.exports = router;
