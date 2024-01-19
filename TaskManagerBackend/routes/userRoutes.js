const express = require('express');

const User = require('../models/User');

const router = express.Router();

router.get('/', (req, res) => {
    res.send("User routes are working!");
})

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
})
router.post('/login', async (req, res) => {});

//register a user
//login a user
module.exports = router; 