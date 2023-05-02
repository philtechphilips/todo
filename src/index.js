const express = require('express')
require('./db/mongoose') // Importing the mongoose configuration
const User = require('./models/user') // Importing the User model
const Task = require('./models/task') // Importing the Task model
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const cors = require('cors');
require('dotenv').config();

const app = express()
const port = process.env.PORT

app.use(express.json()) // Parsing incoming JSON data
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log('Server started on port ' + port)
})


