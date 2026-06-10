import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { useState } from "react";
import axios from "axios";
import formatDate from "../utils/formatDate"
import {
  setCommentLike,
  updateCommentInSelectedBlog,
  setReplies,
 setUpdatedCommentAndReply,
  setDeletedCommentAndReply
} from "../utils/selectedBlogSlice";
import toast from "react-hot-toast";

function Comment() {
  const { token, userId } = useSelector((state) => state.user);
  const { _id: blogId, comments } = useSelector((state) => state.selectedBlog);

  
  const [comment, setComment] = useState();
  const [updatedComment, setUpdatedComment] = useState();
  const [showPopUp, setShowPopUp] = useState(null)
  const [showEdit, setShowEdit] = useState(null)


 
  const dispatch = useDispatch();
  async function handleComment() {
    try {
     
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
      { comment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
     toast.success(res.data.message)
    dispatch(updateCommentInSelectedBlog(res.data.userComment));
    setComment("")
    } catch (error) {
      toast.error(error.response.data.message)
    }
    
   
  }

  
  async function handleActiveReply(parentCommentId) {
    setactiveReply((prev) => (prev == null ? parentCommentId : null));
  }

  return (
    <div className="h-screen max-sm:w-[80%]  fixed top-0 right-0 w-96 bg-white border drop-shadow-xl overflow-y-scroll">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <p className="text-xl mt-2 p-2">Comments</p>
          <i
            onClick={() => dispatch(setIsOpen(false))}
            className="fi fi-tr-x mt-3 mr-4"
          ></i>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          type="text"
          placeholder="comment..."
          className="w-full focus:outline-none tex-xl p-2  border  resize-none h-32"
        />

        <button
          onClick={handleComment}
          className="bg-green-500 text-white p-2 text-2xl rounded-xl mt-2 ml-2"
        >
          Add
        </button>

        <div className="mt-4 w-full ">
      
          <DisplayComments
            comments={comments}
            userId={userId}
            blogId={blogId}
            token={token}
            showPopUp={showPopUp}
            setShowPopUp={setShowPopUp}
            showEdit={showEdit}
            setShowEdit={setShowEdit}
            updatedComment={updatedComment}
            setUpdatedComment={setUpdatedComment}
          />
        </div>
      </div>
    </div>
  );
}

function DisplayComments({ comments, userId, blogId, token, showPopUp, setShowPopUp, showEdit, setShowEdit, updatedComment, setUpdatedComment }) {
           
  const [reply, setReply] = useState();
  const [activeReply, setactiveReply] = useState(null);
  const dispatch = useDispatch()

  async function handleReply(parentCommentId) {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/comment/${parentCommentId}/${blogId}`,
      { reply },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  
      setReply("")
     setactiveReply(null)
  
    dispatch(setReplies(res.data.newReply))
    
    
  }

  async function handleCommentLike(commentId) {
    try {
      let res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(setCommentLike({ commentId, userId }));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error);
    }
  }

  async function handleActiveReply(parentCommentId) {
    setactiveReply((prev) => (prev == null ? parentCommentId : null));
  }

  async function handleUpdateComment(commentId) {
    try{
    
    let res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${commentId}`,
      {updatedComment},
      {
        headers :{
          Authorization: `Bearer ${token}`
        }
      }
    )

    let {data:{ afterUpdationComment}} = res
    toast.success(res.data.message)

       setShowEdit(null)
    setShowPopUp(null)
    dispatch(setUpdatedCommentAndReply(afterUpdationComment))
  }
  catch(error){

    toast.error(error.response.data.message)
  }
  }

  async function handleDeleteComment(commentId) {
    try{
      let res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${commentId}`,
      
        {
        headers: {
          Authorization: `Bearer ${token}`
        }
        }
       
      )

      toast.success(res.data.message)
     dispatch(setDeletedCommentAndReply(commentId))
    }
    catch(error){
      toast.error(error.response.data.message)
      
    }
  }

  async function handleCancelBtn() {
    setShowEdit(null)
    setShowPopUp(null)

  }
  return (
    <>
      {comments ? (
        comments.map((comment) => (
          <div key={comment._id} className="border border-black  p-2">
            <div className="flex justify-between">
              <div className="flex justify-center items-center gap-3">
                <div className="w-10 h-10">
                  <img
                    className="rounded-xl"
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=vishal`}
                    alt=""
                  />
                </div>

                <div>
                  <p className="text-xl">{comment.user.name}</p>
                  <p className="text-xl">{formatDate(comment.createdAt)}</p>
                </div>
              </div>


              {
                 showPopUp === comment._id? (<div className="bg-slate-100 w-[70px]">
                    <i onClick={()=> setShowPopUp(null)} className="fi fi-tr-x mt-3 mr-4 ml-12  bg-white w-auto"></i>
                  <div className="w-full border border-white">
                    <button onClick={()=> setShowEdit(comment._id)}  className="text-xl hover:bg-blue-400 w-full">Edit</button>
                  </div>

                  <div className="w-full border border-white">
                    <button onClick={()=> handleDeleteComment(comment._id)} className="text-xl hover:bg-blue-400 w-full">Delete</button>
                    </div>
                 </div>) :   (<i onClick={()=> setShowPopUp(comment._id)}  className="fi fi-rs-menu-dots"></i>)
              }
            

            </div>

            <p className="font-semibold text-xl">{comment.comment}</p>

            <div className=" flex items-center w-full gap-2">
              <div className="flex gap-2 items-center ">
                {comment.likes.includes(userId) ? (
                  <i
                    onClick={() => handleCommentLike(comment._id)}
                    className="fi fi-sr-thumbs-up mt-1 text-2xl"
                  ></i>
                ) : (
                  <i
                    onClick={() => handleCommentLike(comment._id)}
                    className="fi fi-rr-social-network text-blue-500 mt-1 text-2xl"
                  ></i>
                )}

                <p className="text-xl">{comment.likes.length}</p>
              </div>

              <div className="flex justify-between w-full">
                <div className="flex gap-2 items-center">
                  <i className="fi fi-sr-comment-alt mt-1 text-2xl"></i>
                  <p className="text-xl">{comment.replies.length}</p>
                </div>
                <p
                  onClick={() => handleActiveReply(comment._id)}
                  className="text-xl hover:underline cursor-pointer"
                >
                  reply
                </p>
              </div>
            </div>

            {activeReply === comment._id && (
              <div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  type="text"
                  placeholder="comment..."
                  className="w-full focus:outline-none tex-xl p-2  border border-black  resize-none h-32"
                />

                <button
                  onClick={() => handleReply(comment._id)}
                  className="bg-green-500 text-white p-2 text-2xl rounded-xl mt-2 ml-2"
                >
                  Add
                </button>
               
              </div>
            )}




             {
                      showEdit == comment._id ? <div className="border my-2">
                        
                          

        <textarea
          defaultValue={comment.comment}
          onChange={(e) => setUpdatedComment(e.target.value)}
          type="text"
          placeholder="comment..."
          className="w-full focus:outline-none tex-xl p-2  border border-black  resize-none h-32"
        />

        <button
         onClick={handleCancelBtn} 
          className="bg-red-500 text-white p-2 text-2xl rounded-xl mt-2 ml-2 "
        >
           Cancel
        </button>

          <button
         onClick={()=> handleUpdateComment(comment._id)} 
          className="bg-green-500 text-white p-2 text-2xl rounded-xl mt-2 ml-2"
        >
          update
        </button>

                      </div>  : ""
                  }



           {
            comment.replies.length> 0 && <DisplayComments
            comments={comment.replies}
            userId={userId}
            blogId={blogId}
            token={token}
            showPopUp={showPopUp}
            setShowPopUp={setShowPopUp}
            showEdit={showEdit}
            setShowEdit={setShowEdit}
             updatedComment={updatedComment}
            setUpdatedComment={setUpdatedComment}
          />
           }


          </div>
        ))
      ) : (
        <h1>No Comments.</h1>
      )}
    </>
  );
}

export default Comment;
