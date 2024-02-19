// middlewares/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).send({ error: 'No token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.status(401).send({ error: 'Token is not valid' });
        }

        const user = await User.findOne({
            _id: decoded._id,
        });

        if (!user) {
            throw new Error('Unable to login, invalid credentials');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ error: error.message });
    }
};

module.exports = auth;
