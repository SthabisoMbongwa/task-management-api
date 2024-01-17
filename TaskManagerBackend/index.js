const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('dotenv').config();
const PORT = process.env.PORT;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Task Manager API is working!'
    })
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
})