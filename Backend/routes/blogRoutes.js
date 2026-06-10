const express = require('express')
const cors = require('cors')
const { getBlog, getBlogs, createBlog, updateBlog, deleteBlog, createLike,saveBlog ,searchBlog} = require('../controllers/blogcontroller')
const verifyUser = require('../middlewares/auth')
const { addComment, deleteComment, editComment, likeComment,addNestedComment } = require('../controllers/commentController')
const upload = require('../utils/multer')
const route = express.Router()

route.get('/blogs', getBlogs)

route.get('/blogs/:blogId', getBlog)

route.post('/blogs',verifyUser,upload.fields([{name :"image", maxCount:1}, {name: "images"}]), createBlog)

route.put('/blogs/:id',verifyUser,upload.fields([{name :"image", maxCount:1}, {name: "images"}]), updateBlog)

route.put('/blogs/deleteBlog/:id',verifyUser, deleteBlog)

route.post('/blogs/like/:id', verifyUser, createLike)
route.post('/blogs/comment/:id', verifyUser, addComment)
route.delete('/blogs/comment/:id', verifyUser, deleteComment)
route.put('/blogs/edit-comment/:id', verifyUser, editComment)
route.put('/blogs/like-comment/:id', verifyUser, likeComment)

route.post('/comment/:parentCommentId/:id', verifyUser, addNestedComment)

// save blog route

route.post('/save-blog/:id', verifyUser, saveBlog)

// fetch Search Blog

route.get('/search-blogs', searchBlog)

module.exports = route