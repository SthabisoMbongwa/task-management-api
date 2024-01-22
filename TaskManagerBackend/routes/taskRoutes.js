const express = require('express');


const router = express.Router();
const auth = require('../middlewares/auth')

router.get('/test',auth, (req, res) => {
    res.send("Task routes are working!");
});

//CRUD tasks
module.exports = router;