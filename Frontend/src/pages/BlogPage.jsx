import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  addSelectedBlog,
  removeSelectedBlog,
  updateLikeInSelectedBlog,
  updateSaveInSelectedBlog,
} from "../utils/selectedBlogSlice";
import { setIsOpen } from "../utils/commentSlice";
import { handleSaveBlog } from "../components/Homepage";
import formatDate from "../utils/formatDate";
import { updateFollowing } from "../utils/userSlice";
import Comment from "./Comment";

function BlogPage() {
  const { token, email, userId, name } = useSelector((state) => state.user);
  const {
    likes,
    comments,
    content,
    _id: deleteBlogId,
  } = useSelector((state) => state.selectedBlog);
  const { isOpen } = useSelector((state) => state.Comment);
  const dispatch = useDispatch();
  const [singleBlog, setSingleBlog] = useState(null);

  const [isLike, setIsLike] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { blogId } = useParams();
  const navigate = useNavigate()

  let location = useLocation();

  async function fetchBlogById() {
    try {
      const {
        data: { blog },
      } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}`);

      setSingleBlog(blog);
      dispatch(addSelectedBlog(blog));
    
      if (blog.likes.includes(userId)) {
        setIsLike((prev) => !prev);
      }

      if (blog.totalSaves.includes(userId)) {
        setIsSaved((prev) => !prev);
      }

      if (blog.creator.followers.includes(userId)) {
        setIsFollowing((prev) => !prev);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleLike(params) {
    if (token) {
      try {
        setIsLike((prev) => !prev);
        let res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${singleBlog._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch(updateLikeInSelectedBlog(userId));

        toast.success(res.data.message);
      } catch (error) {
        toast.error(error);
      }
    } else {
      toast.error("You cannot like this blog without login");
    }
  }

  async function handleFollow(creatorId) {
    if(token){

    try {
      setIsFollowing((prev) => !prev);

      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/follow-creator/${creatorId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(updateFollowing(userId));

      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message)
    }
    }else{
      toast.error("You cannot follow user without login");

    }



  }

  async function handleSaveInFrontendAlso(e, singleBlogId, token) {
    if(token){

    handleSaveBlog(e, singleBlogId, token);
    setIsSaved((prev) => !prev);
    dispatch(updateSaveInSelectedBlog(userId));
    }else{
      toast.error("You cannot save this blog without login");

    }

  }

  async function handleDeleteBlog() {
    try {
    
     
      let res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/deleteBlog/${deleteBlogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message);
      navigate('/')
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  useEffect(() => {
    fetchBlogById();

    return () => {
      dispatch(setIsOpen(false));
      
      if (
        window.location.pathname != `/blog/${blogId}` &&
        window.location.pathname != `/edit-blog/${blogId}`
      ) {

        dispatch(removeSelectedBlog());

   
      }
    };
  }, []);
  return (
    <div className="max-w-screen max-sm:mt-14">
      <div className="max-sm:max-w-full max-sm:p-2 max-lg:max-w-[70%]  max-w-[55%] mx-auto  mt-3 ">
        {singleBlog ? (
          <div className="flex flex-col gap-3 ">
            <h1 className="text-6xl max-sm:text-2xl max-md:text-4xl font-semibold">
              {singleBlog.title}
            </h1>
            <h1 className="text-3xl max-sm:text-xl max-md:text-3xl">
              {singleBlog.description}
            </h1>

            <div className="flex items-center gap-2">
              <Link to={`/@${singleBlog.creator.username}`}>
                <div className="w-10 h-10">
                  <img
                    className="rounded-xl"
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${name}`}
                    alt=""
                  />
                </div>
              </Link>
              <div className="">
                <div className="flex gap-2 items-center">
                  <Link to={`/@${singleBlog.creator.username}`}>
                    <p className="max-sm:text-sm  text-2xl hover:underline">
                      {singleBlog.creator.name}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleFollow(singleBlog.creator._id)}
                    className="p-1 max-sm:text-sm text-xl rounded-xl border border-black "
                  >
                    {isFollowing ? "following" : "follow"}
                  </button>
                </div>

                <div className="flex gap-2">
                  {/* <p>6 min read</p> */}
                  <p className="max-sm:text-sm" >{formatDate(singleBlog.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="max-h-90 max-w-full">
              <img
                className="aspect-video max-h-90 w-full border "
                src={singleBlog.image}
                alt=""
              />
            </div>

            <div className="">
              {email === singleBlog.creator.email && (
                <div className="flex gap-2 border">
                  <Link to={`/edit-blog/${blogId}`}>
                    <button className=" p-2 text-2xl rounded-xl bg-green-400 text-white">
                      Edit
                    </button>
                  </Link>
                  <button
                    className=" p-2 text-2xl rounded-xl bg-green-400 text-white"
                    onClick={handleDeleteBlog}
                  >
                    delete blog
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-5">
              <div className="flex gap-2 items-center ">
                {isLike ? (
                  <i
                    onClick={handleLike}
                    className="fi fi-sr-thumbs-up mt-1 text-2xl"
                  ></i>
                ) : (
                  <i
                    onClick={handleLike}
                    className="fi fi-rr-social-network text-blue-500 mt-1 text-2xl"
                  ></i>
                )}
                <p className="text-xl">{likes.length}</p>
              </div>

              <div className="flex gap-2 items-center">
                <i
                  onClick={() => dispatch(setIsOpen())}
                  className="fi fi-sr-comment-alt mt-1 text-2xl"
                ></i>
                <p className="text-xl">{comments.length}</p>
              </div>

              {
                //  singleBlog?.totalSaves?.includes(userId)
                // (e)=> handleSaveBlog(e, singleBlog._id, token)
                isSaved ? (
                  <i
                    className="fi fi-sr-bookmark text-2xl mt-1"
                    onClick={(e) =>
                      handleSaveInFrontendAlso(e, singleBlog._id, token)
                    }
                  ></i>
                ) : (
                  <i
                    className="fi fi-rr-bookmark text-2xl mt-1"
                    onClick={(e) =>
                      handleSaveInFrontendAlso(e, singleBlog._id, token)
                    }
                  ></i>
                )
              }
            </div>

            <div>
              {content.blocks.map((block, id) => {
                if (block.type === "header") {
                  if (block.data.level == 4) {
                    return (
                      <h4 className="mt-2"
                        key={id}
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                      ></h4>
                    );
                  } else if (block.data.level == 2) {
                    return (
                      <h2 className="mt-2"
                        key={id}
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                      ></h2>
                    );
                  } else if (block.data.level == 3) {
                    return (
                      <h3 className="mt-2"
                        key={id}
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                      ></h3>
                    );
                  }
                } else if (block.type === "paragraph") {
                  return (
                    <p className="mt-2"
                      key={id}
                      dangerouslySetInnerHTML={{ __html: block.data.text }}
                    ></p>
                  );
                } else if (block.type === "image") {
                  return (
                    <div key={id} className="mt-2">
                      <div>
                        <img src={block.data.file.url} alt="" />
                        <p className="text-center">{block.data.caption}</p>
                      </div>
                    </div>
                  );
                } else if (block.type === "code") {
                  return (
                    <div key={id}> className="mt-2"
                      <pre className="code-block">
                        <code>{block.data.code}</code>
                      </pre>
                    </div>
                  );
                } else if (block.type === "checkbox") {
                  return (
                    <div key={id} className="mt-2">
                      <label key={id}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          readOnly
                        />
                        {item.text}
                      </label>
                    </div>
                  );
                }
                else if (block.type == "List") {
                if (block.data.style == "ordered") {
                  return (
                    <ol key={id} className="list-decimal my-2">
                      {block.data.items.map((item, id) => (
                        <li key={id}>{item?.content}</li>
                      ))}
                    </ol>
                  );
                } else {
                  return (
                    <ul key={id} className="list-disc my-2">
                      {block.data.items.map((item, id) => (
                        <li key={id}>{item?.content}</li>
                      ))}
                    </ul>
                  );
                }
              }
             

              })}

          </div>
       
      </div> ) : (
          <h1>Loading</h1>
        )} 
      </div>
        <hr className="h-2"/>
      {isOpen && <Comment/>}
    </div>
  );
}

export default BlogPage;
