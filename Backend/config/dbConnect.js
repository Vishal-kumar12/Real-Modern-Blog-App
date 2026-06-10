const mongoose = require('mongoose')
const { DB_URL } = require('./dotenv.config')

require('dotenv').config()
async function dbConnect(){
    try{
    await mongoose.connect(DB_URL)
    console.log("database created successfullly!")
    }
    catch(err){
        console.log("Not able to connect server through mongodb")
        console.log(err.message)
    }

}

module.exports =dbConnect