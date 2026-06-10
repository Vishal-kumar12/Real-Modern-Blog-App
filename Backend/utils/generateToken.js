const jwt = require("jsonwebtoken")
require('dotenv').config()
const { JWT_SECRET } = require("../config/dotenv.config")

async function generateJWT(payload){
   const token =  await jwt.sign(payload, JWT_SECRET)
   return token
}

async function verifyJWT(token) {
   try{
  let data =  await jwt.verify(token, JWT_SECRET) 
  return data
   }
   catch(err){
      return false
   }
}


async function decodeJWT(token) {
   const decoded = await jwt.decode(token) 
   return decoded
}
module.exports= {generateJWT,verifyJWT,decodeJWT}