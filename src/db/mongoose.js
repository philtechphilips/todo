const mongoose = require('mongoose');
const validator = require('validator')
require('dotenv').config();
//Set up default mongoose connection
const mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true });