import { createActionCreatorInvariantMiddleware, createSlice, current } from "@reduxjs/toolkit";

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState: JSON.parse(localStorage.getItem("selectedBlog")) || {},
  reducers: {
    addSelectedBlog(state, action) {
      localStorage.setItem("selectedBlog", JSON.stringify(action.payload));
      return action.payload;
    },

    removeSelectedBlog(state, action) {
      localStorage.removeItem("selectedBlog");
      return {};
    },

    updateLikeInSelectedBlog(state, action) {
      
      if (state.likes.includes(action.payload)) {
        state.likes = state.likes.filter((like) => like != action.payload);
      } else {
        state.likes = [...state.likes, action.payload];
      }
      return state;
    },

     updateSaveInSelectedBlog(state, action) {
    
      if (state.totalSaves.includes(action.payload)) {
        state.totalSaves = state.totalSaves.filter((save) => save != action.payload);
      } else {
        state.totalSaves = [...state.totalSaves, action.payload];
      }
     

      return state;
    },

    updateCommentInSelectedBlog(state, action) {
      state.comments = [...state.comments, action.payload];
      return state;
    },

    setCommentLike(state, action) {
      const { commentId, userId } = action.payload;
    

      function toggleCommentLike(comments){
        return comments.map((comment)=> {

           if(comment._id == commentId){

            if (comment.likes.includes(userId)) {
             comment.likes = comment.likes.filter((like) => like != userId);
             return comment
           } else {
            comment.likes = [...comment.likes, userId];
            return comment
            }
           }


           if(comment.replies && comment.replies.length > 0){
            return {...comment, replies: toggleCommentLike(comment.replies)}
           }
           return comment
        })
      }

      state.comments = toggleCommentLike(state.comments)
    },

    setReplies(state, action) {
      let newReply = action.payload;
      function findParentComment(comments) {
        let parentComment;
        for (let comment of comments) {
          if (comment._id === newReply.parentComment) {
            parentComment = {
              ...comment,
              replies: [...comment.replies, newReply],
            };
            break;
          }

          if (comment.replies.length > 0) {
            parentComment = findParentComment(comment.replies);
            if (parentComment) {
              parentComment = {
                ...comment,
                replies: comment.replies.map((reply) => {
                  return reply._id == parentComment._id ? parentComment : reply;
                }),
              };

              break;
            }
          }
        }

        return parentComment;
      }

      let parentComment = findParentComment(state.comments);

      state.comments = state.comments.map((comment) => {
        return comment._id == parentComment._id ? parentComment : comment;
      });
    },

    setUpdatedCommentAndReply(state, action) {
       function updateComment(comments) {
        return comments.map((comment) =>
          comment._id == action.payload._id
            ? { ...comment, comment: action.payload.comment }
            : comment.replies && comment.replies.length > 0
              ? { ...comment, replies: updateComment(comment.replies) }
              : comment,
        );
      }
      state.comments = updateComment(state.comments);
    
    },

    setDeletedCommentAndReply(state, action) {
      function deleteComment(comments) {
       
         return comments.filter((comment) => comment._id != action.payload).map((comment) =>
            comment.replies && comment.replies.length > 0
              ? { ...comment, replies: deleteComment(comment.replies) }
              : comment,
          );
      }

      state.comments =  deleteComment(state.comments);
     
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  updateLikeInSelectedBlog,
  updateSaveInSelectedBlog,
  updateCommentInSelectedBlog,
  setCommentLike,
  setReplies,
  setUpdatedCommentAndReply,
  setDeletedCommentAndReply,
} = selectedBlogSlice.actions;
export default selectedBlogSlice.reducer;
