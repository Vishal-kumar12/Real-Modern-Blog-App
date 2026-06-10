const { verifyJWT } = require("../utils/generateToken")


const verifyUser = async (req, res, next) =>{

try{
  
const token = req.headers.authorization.replace("Bearer ", "")
if(!token){
   return res.status(400).json({
        success: false,
        message: "Please Sign In token not found"
    })
}

const verifiedUser  = await verifyJWT(token) 
if(!verifiedUser){
    return res.status(400).json({
        success: false,
        message: "Please Sign In"
    })
}

req.user = verifiedUser.id
next()
}
catch(err){
  return res.status(400).json({
        success: false,
        message: "Please Sign In",
        error:err.message
    })
}

}
module.exports = verifyUser