import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Underline from '@editorjs/underline';
import CodeTool from '@editorjs/code';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import EditorjsList from '@editorjs/list';
import { removeSelectedBlog } from "../utils/selectedBlogSlice";
function AddBlog() {
   const dispatch = useDispatch()
  const {id} = useParams()
   const editorjsRef = useRef(null)
  
    const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
    draft: false,
    tags:[]

  });

  
  const formData = new FormData()
  const {token }= useSelector(slice=> slice.user)
  const selectedBlog = useSelector(slice=> slice.selectedBlog)
  const navigate = useNavigate();
  if (!token) {
    useEffect(()=>{
    navigate("/signin");
    },[])

  }


  async function handleAddBlog() {

    formData.append("title", blogData.title)
    formData.append("description", blogData.description)
    formData.append("image", blogData.image)
    formData.append("content", JSON.stringify(blogData.content))
    formData.append("draft", blogData.draft)
    formData.append("tags", JSON.stringify(blogData.tags))
   blogData.content.blocks.forEach((block)=>{
    if(block.type === "image"){
    formData.append("images", block.data.file.image)
    }
   })
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
             "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(res.data.message)
      navigate('/')
    } catch (error) {
        toast.error(error.message)
    }


  }

 async function fetchBlogById() {
  
    try {
   
      setBlogData({
        title: selectedBlog.title,
        description: selectedBlog.description,
        image:selectedBlog.image,
        content: selectedBlog.content,
        tags: selectedBlog.tags,
        draft: selectedBlog.draft
      })
  
    } catch (error) {
    }
  }

  async function handleEditBlog() {
   


    const formData = new FormData()
    formData.append("title", blogData.title)
    formData.append("description", blogData.description)
    formData.append("image", blogData.image)
    formData.append("content", JSON.stringify(blogData.content))
     formData.append("draft", blogData.draft)
    formData.append("tags", JSON.stringify(blogData.tags))
    
  let existingImages = []
    blogData.content.blocks.forEach((block)=> {
        if(block.type === 'image'){
           if(block.data.file.image){
                formData.append("images", block.data.file.image)
           }else{
            existingImages.push({
              url: block.data.file.url,
              imageId: block.data.file.imageId
            })
                
           }
    }
    })


    formData.append("existingImages", JSON.stringify(existingImages))
    
    


    try {

     const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
        formData,
        {
          headers: {
             "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
   
      toast.success(res.data.message)
      navigate('/')
    } catch (error) {
        toast.error(error.message)
    }
  }

  function initializeEditorjs(){
          editorjsRef.current = new EditorJS({
          holder: "editorjs",
          placeholder: "write something...",
          data: selectedBlog.content,
          tools: {
           header: {
             class: Header,
            inlineToolbar: true,
            config:{
              placeholder: "Enter a header",
              levels: [2, 3, 4],
              defaultLevel: 3
            },
           },

           List:{
               class:EditorjsList,
               inlineToolbar:true
           },
           Underline: Underline,
           code:CodeTool,

           image:{
            class: ImageTool,
            config:{
              uploader:{
                uploadByFile : async (image)=>{
                 return {
                success: 1,
                file: {
                  url: URL.createObjectURL(image),
                  image
                }
                }
              }
            }
           }
       
           },
            
          },

          onChange : async ()=>{
            let data =await  editorjsRef.current.save()
            setBlogData((prev)=> ({...prev, content:data}))

          }
        })
  }
 

 async function handleAddTag(e){
 
    let data = e.target.value.toLowerCase()
    
    if(e.code == 'Enter'){
     

    if(blogData.tags.includes(data)){
      toast.error("tag already exist!")
    }
    else{
      if(blogData.tags.length < 10){
        setBlogData((prev)=> ({...prev, tags:[...prev.tags, data]}))
        
      }
         
    }
    e.target.value = ""

    }

 }

 async function handleDeleteTag(index) {
 
 setBlogData((prev)=> ({...prev, tags: prev.tags.filter((tag,tagIndex)=> (tagIndex !== index))}))
 }

  useEffect(()=>{
    if(id){
fetchBlogById()
    }

  },[id])

  useEffect(()=>{
    if(window.location.pathname  == '/add-blog'){
      // setBlogData(()=> {})
      // editorjsRef.current = null
      dispatch(removeSelectedBlog())

    }
    if(editorjsRef.current === null){
     initializeEditorjs()
    }

    return ()=>{
      editorjsRef.current = null
    }

  },[])

  return (
   <div className="max-w-screen border  max-sm:mt-14">
    <div className="max-sm:w-[60%] max-sm:mx-12 mx-auto  max-md:w-[50%] w-[40%] max-xl:mx-36  mt-2">
      
      <div className="w-full  lg:w-[800px] lg:flex lg:gap-5">

       <div className=" w-full lg:w-3/5">
        <h1 className="text-2xl mt-2">Image</h1>

      <label htmlFor="image" className="">
       
           { blogData?.image ?
           <div className="rounded-xl">
                  <img  src={typeof(blogData.image) == "string" ? blogData.image : URL.createObjectURL(blogData.image)} className="aspect-video object-cover rounded-xl" alt="" /> 
           </div>
           : <div className="border w-full aspect-video flex justify-center items-center text-4xl bg-white rounded-xl">Select Image</div>
     }
      </label>
      <input
      className="hidden"
        type="file"
        id="image"
        onChange={(e) =>
          setBlogData((prev) => ({ ...prev, image: e.target.files[0]}))
        }
      />
      </div>



      <div className="my-2 lg:w-2/6">
      <div>
        <h1 className="text-2xl">Title</h1>
        <input
        type="text"
        placeholder="title..."
        onChange={(e) =>
          setBlogData((prev) => ({ ...prev, title: e.target.value }))
        }
        value={blogData?.title}
        className="w-full p-2 my-2 placeholder:text-xl focus:outline-none border text-xl"

      />
      </div>
      
        <div>
        <h1 className="text-2xl">Tags</h1>
        <input
        type="text"
        placeholder="tags..."
        
       
       
        onKeyDown={(e)=> handleAddTag(e)}
        
       
        className="w-full p-2 mt-2 placeholder:text-xl focus:outline-none border text-xl"

      />
      <div className="flex justify-between">
         <p className=" text-xs opacity-50">press Enter to add tags</p>
         {blogData?.tags?.length >10 && toast.error("you can add maximum 10 tags only")}
       <p className=" text-xs opacity-50 ">{blogData?.tags?.length < 10?  (10 - blogData.tags.length) : "No"} more tag you can add</p>

      </div>
       <div className="flex flex-wrap gap-2">
        {blogData?.tags && blogData?.tags.map((tag,index)=>(
          <div key={index} className="bg-gray-400 flex gap-2 items-center text-xl p-1 rounded-xl mt-2 min-w-32 hover:text-white hover:bg-blue-400">
          <p className="">{tag}</p>
          <i onClick={()=> handleDeleteTag(index)} className="fi fi-rr-cross-circle mt-2 text-xl"></i>
          </div>
        ))}
       </div>

      </div>
      


      </div>
      </div>

    
    <div>
        <h1 className="text-2xl">Description</h1>

        <textarea 
        type="text" 
         placeholder="Enter description"
        onChange={(e) =>
          setBlogData((prev) => ({ ...prev, description: e.target.value }))
        }
        value={blogData?.description}
        className=" w-full focus:outline-none tex-xl p-2  border rounded-xl resize-none my-2"
        />

    </div>

   
     <div>
        <h1 className="text-2xl">Draft</h1>

      
        <select value={blogData?.draft}  onChange={(e)=> setBlogData((prev)=> ({...prev , draft: e.target.value =="true" ? true : false }))} name="" id="" className=" w-full focus:outline-none tex-xl p-2  border rounded-xl  my-2">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        
        <>
       </>
    </div>


      
      
      <div className="mt-2">
          <h1 className="text-2xl ">Content</h1>
       <div id="editorjs" className="border rounded-xl my-2"></div>
      </div>
    

      <button 
       onClick={id? handleEditBlog :handleAddBlog}
       className="bg-blue-700 text-white p-2 rounded-xl border text-2xl">
        {id? "Update Blog" : blogData?.draft? "Save as a draft" : "Post Blog"}
        </button>
      
    </div>

    </div>
  );
}

export default AddBlog;

