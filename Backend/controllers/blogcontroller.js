const { json } = require("express");
const Blog = require("../models/blogSchema");
const User = require("../models/userSchema");
const Comment = require("../models/commentSchema")

const bcrypt = require('bcrypt')
const {verifyJWT, decodeJWT}= require('../utils/generateToken');
const verifyUser = require("../middlewares/auth");
const {uploadImage, deleteImage }= require("../utils/uploadImage");
const fs = require('fs')
const path = require("path");
const ShortUniqueId = require('short-unique-id');
const {randomUUID}= new ShortUniqueId({ length: 10 });

async function createBlog(req, res) {
  try {

    const creator = req.user 
  
   

    const { title, description} = req.body;
    let {draft} = req.body
     if(draft == "true"){
      draft=true
    }else{
      draft=false
    }

    const tags = JSON.parse(req.body.tags)
    const{ image,images}= req.files
    const content = JSON.parse(req.body.content)
    

// content k block update kar rhe hai 
let imageIndex = 0
for(let i=0; i< content.blocks.length; i++){
  const block = content.blocks[i]
  if(block.type==="image"){
    const {secure_url, public_id} = await uploadImage(`data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`)
  
    block.data.file = {
      url : secure_url,
      imageId: public_id
    }
   
     imageIndex++
  }
}



    if (!title) {
      return res.status(400).json({
        success: false,
        message: "please enter title",
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "please enter description",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "please add some content",
      });
    }

    const findUser = await User.findById(creator)

    if(!findUser){

      return res.json({
      success: false,
      message: "kon hai bhai tu me to janta hi nhi hi tujhe",

    });


  
    }

    // uploading image on cloudinary
    const {secure_url, public_id} = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)

    const blogId = title.toLowerCase().split(" ").join("-") + "-" + randomUUID()
    const blog = await Blog.create({
      title,
      description,
      draft,
      tags,
      creator,
      image: secure_url,
      imageId: public_id, 
      blogId,
      content
    });


    await User.findByIdAndUpdate(creator, {$push : {blogs: blog._id}})
    return res.status(200).json({
      success: true,
      message: "blog created succesfully",
      blog,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      err:err.message
    });
  }
}



async function getBlogs(req, res) {
  try {
    const page= parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    let  skip = (page-1) * limit
 
    const totalBlogs = await Blog.countDocuments({draft:false})

    const blogs = await Blog.find({ draft: false }).populate({
        path: "creator",
        select: "-password"
    }).populate({
      path:"likes",
      select: "name email"
    }).populate({
      path:"comments",
      populate: {path: 'user', select:"name email"}
    })
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)

    if (!blogs) {
      return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blogs Fetched Successfully",
      blogs,
      hasMore:  skip + limit < totalBlogs
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      err:err.message
    });
  }
}

async function getBlog(req, res) {
  try {
    let { blogId } = req.params;
    let blog = await Blog.findOne({ blogId}).populate({
      path:"creator",
      select:"name email followers username"
    }).populate({
      path:"comments",
      populate: {path:"user" ,
         select:"name email"
        }
     

    }).lean();

      if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }


 
async function populateReplies(comments){
  for(const comment of comments){
   let populatedComment =  await Comment.findById(comment._id).populate({
      path:"replies",
      populate: {
        path:"user",
        select:"name email"
      }
    }).lean()
   comment.replies = populatedComment.replies
    if(comment.replies && comment.replies.length > 0){
        await populateReplies(comment.replies)
    }
    
  }
 return comments
}
 

blog.comments =  await populateReplies(blog.comments)

  

    return res.status(200).json({
      success: true,
      message: "Blog Fetched Successfully",
      blog,
    });
  } catch (err) {
    return res.status(500).json({
      
      success: false,
      message: "some error occurred try again",
      error: err.message
    });
  }
}

async function updateBlog(req, res) {
  try {

    // here id is blog`s id
    let { id } = req.params;
   
    const creator = req.user
    const {image}= req.files
    const {images}= req.files
  
    const { title, description} = req.body;
    let {draft} = req.body
    if(draft == "true"){
      draft=true
    }else{
      draft=false

    }
    
    const content =  JSON.parse(req.body.content)
    const tags =  JSON.parse(req.body.tags)
    const existingImages = JSON.parse(req.body.existingImages)  



const blog = await Blog.findOne({blogId: id}).populate({
  path:"creator",
  select:"name email"
})
   if(!blog) {
        return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }



if((creator != blog.creator._id)){
  return res.status(500).json({
      success: false,
      message: "you are not authorized to do this"
        });
}


let imagesToDelete = blog.content.blocks.filter((block)=> block.type == 'image').filter((block)=> !existingImages.find(({url})=> url == block.data.file.url)).map((block)=> block.data.file.imageId)


if(imagesToDelete.length > 0){
await Promise.all(imagesToDelete.map((id)=> deleteImage(id) ))

}

if(req.files.images){
let imageIndex = 0
for(let i=0; i< content.blocks.length; i++){
  const block = content.blocks[i]
  if(block.type==="image" && block.data.file.image){
    const {secure_url, public_id} = await uploadImage(`data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`)

    block.data.file = {
      url : secure_url,
      imageId: public_id
    }
   
     imageIndex++
  }
}
}

if(req.files.image){
await deleteImage(blog.imageId)

const {secure_url, public_id} = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)

blog.image = secure_url
blog.imageId = public_id
}
blog.title = title || blog.title
blog.description = description || blog.description
blog.flag = draft 
blog.content = content || blog.content
blog.draft = draft 
blog.tags = tags || blog.tags
await blog.save()

    return res.status(200).json({
      success: true,
      message: "Blog updated Successfully",
      blog: blog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error: err.message
        });
  }
}

async function deleteBlog(req, res) {
  try {
    // here id is blog`s id
const creator = req.user


 let { id } = req.params;

    const blog = await Blog.findById(id)
      if(!blog) {
        return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    if(!(blog.creator == creator )){
       return res.status(500).json({
        success: false,
        message: "You are not authorized to do this",
      });
    }



    if(blog.likes.length > 0){
  

     await User.updateMany(
         { _id: { $in: blog.likes } },
         { $pull: { likeBlogs: id } }
         );
    }

    




     if(blog.totalSaves.length > 0){
           
   
    
     await User.updateMany(
         { _id: { $in: blog.totalSaves } },
         { $pull: {savedBlogs: id} }
         );

     }

     





     async function deleteCommentAndReplies(id){
         
          let comment = await Comment.findById(id).populate({
            path:"parentComment",
            select: "_id"
          })
            for(let replyId of comment.replies){
                 await deleteCommentAndReplies(replyId)
             }
         
         if(comment.parentComment){
          await Comment.findByIdAndUpdate(comment.parentComment, {$pull: {replies: id}})
    
         }
          await Comment.findByIdAndDelete(id)
        }
    

      if(blog.comments.length > 0){
         for(let i=0; i<blog.comments.length; i++){
        let commentId = blog.comments[i];
        await deleteCommentAndReplies(commentId)

      }
      }
      

     
    

     if(blog.content.blocks.length > 0){
        let imagesToDelete = blog.content.blocks.filter((block)=> block.type == "image")
        if(imagesToDelete.length > 0){
          await Promise.all(imagesToDelete.map((item)=> deleteImage(item.data.file.imageId)))
        }

     }

     if(blog.imageId){
      await deleteImage(blog.imageId)
     }


    

    await Blog.findByIdAndDelete(id)
    
    return res.status(200).json({
      success: true,
      message: "Blog deleted Successfully",
    });


  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error:err.message
    });
  }
}



async function createLike(req,res){

  try {
    // here id is blog`s id
    const {id} = req.params
    const creator = req.user

    
    const blog = await Blog.findById(id)
   
       if(!blog) {
        return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    if(!blog.likes.includes(creator)){
      await Blog.findByIdAndUpdate(id, {$push : {likes : creator}} ,{new:true})
      await User.findByIdAndUpdate(creator, {$push: {likeBlogs: id}}, {new: true})

     return res.status(200).json({
        success: true,
        message: "Liked Successfully",
        isLike: true
     })
      
    }

    else{
    
      await Blog.findByIdAndUpdate(id , {$pull: {likes : creator}},{new:true})
      await User.findByIdAndUpdate(creator, {$pull: {likeBlogs: id}}, {new: true})
  
     
     
     return res.status(200).json({
        success: true,
        message: "Unliked Successfully",
        isLike: false

     })

    }

  } catch (err) {
     return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error:err.message
    });
  }
}

async function saveBlog(req,res){

  try {
    // here id is blog`s id
    const {id: blogId} = req.params
    const userId = req.user
    
    const user = await User.findById(userId)
   
       if(!user) {
        return res.status(404).json({
        success: false,
        message: "user Not Found",
      });
    }

    if(!user.savedBlogs.includes(blogId)){

      await User.findByIdAndUpdate(userId, {$push : {savedBlogs : blogId}} ,{new:true})
      await Blog.findByIdAndUpdate(blogId, {$push: {totalSaves: userId}}, {new: true})
  
     
     return res.status(200).json({
        success: true,
        message: "saved",
        isSaved: true
     })
      
    }

    else{
      await User.findByIdAndUpdate(userId, {$pull: {savedBlogs : blogId}} ,{new:true})
      await Blog.findByIdAndUpdate(blogId, {$pull: {totalSaves: userId}}, {new: true})

     
     
     return res.status(200).json({
        success: true,
        message: "unsaved",
        isSaved: false

     })

    }

  } catch (err) {
     return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error:err.message
    });
  }
}

async function searchBlog(req, res){
   try {
      const page= parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    let  skip = (page-1) * limit
 
    const {search} = req.query
    
     
    const query = {
      $or : [
        {title: {$regex: search.trim(), $options:"i"}},
        {description: {$regex: search.trim(), $options:"i"}}
       
      ]}

    let blogs = await Blog.find(query, {draft:false}
    )
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit)

    
    const totalBlogs = await Blog.countDocuments(query,{draft:false})
   
    if(blogs.length == 0){
      return res.status(404).json({
        success: false,
        message: "no result found related to this search please explain in detail what you want",
       
      })
    }

   
    return res.status(200).json({
      success: true,
      blogs,
      hasMore: skip + limit < totalBlogs

    })

    }

   catch (err) {
     return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error:err.message
    });
  }
}


module.exports = { createBlog, updateBlog, getBlog, getBlogs, deleteBlog ,createLike, saveBlog, searchBlog};
