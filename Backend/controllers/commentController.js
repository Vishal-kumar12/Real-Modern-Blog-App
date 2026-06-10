const Blog = require("../models/blogSchema")
const Comment = require("../models/commentSchema")



async function addComment(req, res){
try{

    // here id is blog`s id
const {id} = req.params
const userId = req.user

const {comment} = req.body
if(!comment){
    return res.status(404).json({
        success:false,
        message:"please write comment"
    })
}

const blog = await Blog.findById(id)
 if(!blog) {
        return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }
const userComment = await Comment.create({
comment,
blog : id,
user : userId
}).then((comment)=>{
    return comment.populate({
        path:"user",
        select: "name email"
    })
})


await Blog.findByIdAndUpdate(id, {$push: {comments: userComment._id}})
return res.status(200).json({
    success: true,
    message: "comment added successfully",
    userComment,
    
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


async function deleteComment(req, res){
    try{
    // here id is comment's id
    const {id} = req.params
    const userId = req.user
    const comment = await Comment.findById(id).populate({
        path:"blog",
        select:"creator"

    })
    
    
    if(!comment){
        return res.status(404).json({
    success: true,
    message: "comment not found",
    }) 
    }



    if(comment.user != userId && comment.blog.creator != userId){
        return res.status(400).json({
            success: false,
            message:"You are not authorized to do this"
        })
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

    await deleteCommentAndReplies(id)
    await Blog.findByIdAndUpdate(comment.blog._id, {$pull: {comments: id}})

    return res.status(200).json({
        success: true,
        message:"comment deleted successfully",
      
    })

 }
 catch(err){
     return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error:err.message
    });
 }

}


async function editComment(req, res){
    try{

    // here id is comment`s id
const {id} = req.params
const userId = req.user
const {updatedComment} = req.body

const comment = await Comment.findById(id)
if(!comment){
    return res.status(404).json({
        success:false,
        message:"comment not found"
    })
}

if(comment.user != userId){
     return res.status(400).json({
            success: false,
            message:"You are not authorized to do this"
        })
}



let afterUpdationComment = await Comment.findByIdAndUpdate(id,  {comment: updatedComment}, {new:true})


return res.status(200).json({
    success: true,
    message: "comment updated successfully",
    afterUpdationComment 
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


async function likeComment(req,res){

  try {
    // here id is comment`s id
    const {id} = req.params
    const userId = req.user

    
    const comment = await Comment.findById(id)
   
       if(!comment) {
        return res.status(404).json({
        success: false,
        message: "Comment Not Found",
      });
    }

    if(!comment.likes.includes(userId)){
      await Comment.findByIdAndUpdate(id, {$push : {likes : userId}} ,{new:true})
     
     return res.status(200).json({
        success: true,
        message: "Liked Successfully"
     })
      
    }

    else{
    
      await Comment.findByIdAndUpdate(id , {$pull: {likes : userId}},{new:true})
     
     
     
     return res.status(200).json({
        success: true,
        message: "Unliked Successfully"
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


async function addNestedComment(req,res){

  try {
    // here id is comment`s id
    const {parentCommentId, id:blogId} = req.params
    const userId = req.user

    
    const comment = await Comment.findById(parentCommentId)
   
       if(!comment) {
        return res.status(404).json({
        success: false,
        message: "Comment Not Found",
      });
    }

    const {reply} = req.body
    const newReply = await Comment.create({
        blog: blogId,
        user: userId,
        comment: reply,
        parentComment: parentCommentId

    }).then((reply)=>{
      return reply.populate({
        path:"user",
        select :"name email"
      })
    })


    await Comment.findByIdAndUpdate(parentCommentId, {$push: {replies: newReply._id}},{new:true})
       return res.status(200).json({
        success: true,
        message: "reply added successfully",
        newReply: newReply
     })

  } catch (err) {
     return res.status(500).json({
      success: false,
      message: "some error occurred try again",
      error:err.message
    });
  }
}

module.exports = {addComment, deleteComment, editComment,likeComment, addNestedComment}