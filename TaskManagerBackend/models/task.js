const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Work', 'Personal', 'Shopping'], required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    due_date: { type: Date, required: true },
    status: { type: String, enum: ['Todo', 'InProgress', 'Complete'], default: 'Todo' },
    completed: { type: Boolean, default: false },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    shared_with: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reminder: { type: Date }
}, {
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;