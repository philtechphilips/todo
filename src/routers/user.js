const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const { welcomeMail } = require('../emails/account')
const cors = require('cors');
router.use(cors());

router.use(cors({
    origin: '*'
  }));


// Endpoint for creating a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body) // Creating a new User instance using the request body
    try{
        await user.save() // Saving the user to the database
        welcomeMail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token}) // Sending a success response with the saved user object
    }catch (e){
        if (e.code === 11000) {
            res.status(422).json({ error: 'Email address is already taken' }); // sending an error response as JSON with the error message
        }else{
            res.status(400).send(e) // Sending an error response with the error object
        } 
    }
})


router.post('/users/login', async (req, res) => {
    try{
        if (!req.body.email || !req.body.password) {
            throw new Error('Email and password are required')
        }
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

// Endpoint for getting LoggedIn User Details
router.get('/users/me', auth, async (req, res) => {
   res.send(req.user)
})

// Endpoint for logging user out
router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


// Endpoint for updating profile
router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body) // Get the keys (property names) from the request body
    const allowedUpdates = ['name', 'email', 'password', 'age'] // Define an array of allowed updates
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // Check if all updates are allowed

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid Updates!' }) // If any update is not allowed, send an error response
    }
    
    try{

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user) // Send the updated user object as response
    }catch (e){
        res.status(400).send(e) // If any error occurs, send a 400 response with the error message
    }
})

module.exports = router