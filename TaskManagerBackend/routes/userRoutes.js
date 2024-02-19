// userRoutes.js

const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth'); // Import the auth middleware



router.get('/', (req, res) => {
    res.send("User routes are working!");
})

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

// Fetch all users for admin
router.get('/all', auth, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users, message: "Users Fetched Successfully" });
    } catch (err) {
        res.status(500).send({ error: err });
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
