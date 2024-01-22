const express = require('express');


const router = express.Router();
const auth = require('../middlewares/auth')

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
        
    }
})

module.exports = router;