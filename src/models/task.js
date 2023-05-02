const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required!'],
        trim: true,
        unique: [true, 'Duplicate Todo detected!'],
    },
    description: {
        type: String,
        required: [true, 'Description is required!'],
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {timestamps: true})


const Task = mongoose.model('Task', taskSchema)


module.exports = Task