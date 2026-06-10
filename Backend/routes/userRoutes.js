const express = require('express')
const { createUser, getUser,getUserByUsername, getUserById, updateUser, deleteUser, login, verifyEmail,verifyUserToResetPassword, googleAuth, followCreator , updateVisibilty} = require('../controllers/userController')
const verifyUser = require('../middlewares/auth')
const upload = require('../utils/multer')
const route  = express.Router()

route.post('/signup', createUser)
route.post('/signin', login)




route.get('/users', getUser)

route.get('/users/:username',getUserByUsername)
route.get('/users/following-user/:userId',getUserById)


route.put('/users/:userId' , upload.single("profilePic"), updateUser)

route.delete('/users/:id',verifyUser, deleteUser)

// verify email
route.get('/verify-email/:verificationToken', verifyEmail)



// google auth route
route.post('/google-auth', googleAuth)

route.post('/follow-creator/:creatorId/:userId', verifyUser, followCreator)

route.put('/change-like-save-visibility', verifyUser, updateVisibilty )




module.exports = route