const express = require('express')
const app = express()
const multer = require('multer')

const cors = require('cors')
const dbConnect = require('./config/dbConnect')
const userRoute = require('./routes/userRoutes')
const blogRoute = require('./routes/blogRoutes')
const cloudinaryConfig = require('./config/cloudinaryConfig')
const { PORT } = require('./config/dotenv.config')


app.use(cors())

require('dotenv').config()
const port = PORT || 5000

app.use(express.json())

app.get('/', (req,res)=>{
    res.send("Everything is working good")
})

app.use('/api/v1', userRoute)
app.use('/api/v1', blogRoute)


app.listen(port, ()=>{
    console.log("server created successfully!")
    cloudinaryConfig()
    dbConnect()
})  