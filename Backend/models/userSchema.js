const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
name: {
  type: String,
},

username: {
  type: String,
  required: true,
  unique: true
}, 

email:{
    type:String,
    unique:true
},
password:{
  type: String,
},

bio:{
    type: String,
    default:null

},

blogs: [
   {
     type: mongoose.Schema.Types.ObjectId,
     ref:"Blog"
   }
],

savedBlogs: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Blog"
  }
],

followers:[
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

following: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
],

profilePic: {
  type: String,
  default: null
},

profilePicId: {
  type: String,
  default: null
},

likeBlogs: [
{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Blog"
}

],

showLikeBlogs: {
  type: Boolean,
  default: true
},

showSavedBlogs: {
  type: Boolean,
  default: false
},

isVerify: {
  type: Boolean,
  default: false
},

googleAuth:{
  type: Boolean,
  default: false
}

}, {timestamps: true})



const User = mongoose.model('User', userSchema)

module.exports = User