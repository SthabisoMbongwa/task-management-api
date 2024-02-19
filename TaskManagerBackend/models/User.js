// user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Add this line
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    status: {type: String, enum: ['Active', 'Inactive'], default: 'Active'}
}, {
    timestamps: true
});

userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,  8);
    }

    next();
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
