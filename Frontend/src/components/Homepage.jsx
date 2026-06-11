import axios from "axios"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import formatDate from "../utils/formatDate"
import toast from "react-hot-toast"
import DisplayBlog from "./DisplayBlog"
import usePagination from "../hooks/usePagination"

export async function handleSaveBlog(e, blogId, token){
    e.preventDefault()
    
  try {
    

     let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save-blog/${blogId}`,
    {},
    {
        headers:{
            Authorization: `Bearer ${token}`

        }
    }
   )

   toast.success(res.data.message)
  } catch (error) {
    toast.error(error.response.data.message)
  }

   
}

const Homepage = () =>{
    

    const [page, setPage] = useState(1)
    const tag = ["node", "travelling", "Education", "reading", "mern developer"]
    
   
    const {searchBlogs, hasMore} = usePagination({},"blogs", page, 5)
   

     return (
        <div className="w-[99vw] flex gap-2 max-md:gap-0">
        
        <div className="w-[75%] mt-3 p-2 ">

        {searchBlogs.length > 0 && <DisplayBlog blogs={searchBlogs}/>}
        { hasMore &&  
        <button onClick={()=> setPage((prev)=> prev+1)} className="text-xl bg-blue-500 text-white rounded-xl p-2 mt-2">Load More</button>
         }
    
        </div>

        
         <div className=' w-[calc(100%-75%)] max-h-screen sticky top-0 border max-md:hidden'>
              <p className="font-semibold p-3">Recommended Topics</p>
               <div className="flex flex-wrap gap-2 p-2 w-full">
            {tag.map((tag,index)=>(
            <Link to={`/tag/${tag}`} key={index} className="max-md:w-full">
          <div  className="bg-gray-200 border border-blue-950 flex gap-2  items-center text-lg font-normal p-2 rounded-xl mt-2 hover:cursor-pointer">
          <p className="">{tag}</p>
        
          </div>
           </Link>
        ))}
       </div>
              </div>




        </div>
     
    )
 




  
}


export default Homepage