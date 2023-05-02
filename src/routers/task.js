const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

// Endpoint for creating a new task
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body) 

    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    try{
        await task.save() // Saving the task to the database
        res.status(201).send(task) // Sending a success response with the saved task object
    }catch (e){
        if (e.code === 11000) {
            res.status(422).json({ error: 'Duplicate task detected!' }); // sending an error response as JSON with the error message
        }else{
            res.status(400).send(e) // Sending an error response with the error object
        } 
    }
})

// Get /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks) 
   }catch (e){
        res.status(500).send()
   }
})

// Endpoint for getting a specific task by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id // Extracting the task ID from the request parameters

    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({_id, author: req.user._id})
        if(!task){
            return res.status(404).send() // If task not found, sending a not found response with status code 404
        }

        res.send(task) // Sending the task object as response
    } catch (e) {
        res.status(500).send() // Sending an error response with status code 500
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body) // Get the keys (property names) from the request body
    const allowedUpdates = ['description', 'completed'] // Define an array of allowed updates
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // Check if all updates are allowed

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid Updates!' }) // If any update is not allowed, send an error response
    }
    
    try{
        
        const task = await Task.findOne({ _id: req.params.id, author: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task) 
    }catch (e){
        res.status(400).send(e)
    }
})

// Express route for deleting a user by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // Find and delete the user by ID using Mongoose's findByIdAndDelete method
        const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id})

        // If user is not found, send a 404 status and an empty response
        if (!task) {
            return res.status(404).send()
        }

        // If user is found and deleted successfully, send the deleted user object as response
        res.send(task)
    } catch (e) {
        // If an error occurs, send a 500 status and the error as response
        res.status(500).send(e)
    }
})




module.exports = router