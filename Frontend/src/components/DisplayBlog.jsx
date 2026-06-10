import React from 'react'
import { Link } from 'react-router-dom'
import formatDate from '../utils/formatDate'
import { useSelector } from 'react-redux'
import { handleSaveBlog } from './Homepage'

function DisplayBlog({blogs}) {
        const {token, userId} = useSelector(state=> state.user)
    
  return (
    
    
    <div>
   {

    blogs.length > 0 ? 
    blogs.map((blog)=> (
        <Link key={blog._id} to={`/blog/${blog.blogId} `} className='max-sm:max-w-screen-sm max-w-screen-md md:max-w-[100vw]'>
         <div  className="border  flex  justify-between p-3 items-center mt-3 max-sm:mt-12  max-md:w-[95vw]">
                <div>
                       <div>
                        <p>{blog.creator.name}</p>
                        </div> 

                        <h1 className='text-2xl'>{blog.title}</h1>

                        <p className="line-clamp-2 max-sm:line-clamp-1">{blog.description}</p>

                        <p className=''>{formatDate(blog.createdAt)}</p>
                        
                        <div className="flex gap-3">
                            <p><i className="fi fi-rr-social-network text-black-500 mt-1 text-2xl"></i></p>
                            <p>{blog.likes.length}</p>

     
                        <p><i className="fi fi-sr-comment-alt mt-1 text-2xl"></i></p>
                            <p>{blog.comments.length}</p>
                        
                        {
                          blog?.totalSaves?.includes(userId) ? <i className="fi fi-sr-bookmark text-2xl" onClick={(e)=> handleSaveBlog(e, blog._id, token)}></i> :
                          <i className="fi fi-rr-bookmark text-2xl" onClick={(e)=> handleSaveBlog(e, blog._id, token)}></i>
                        }
                        
                        
                        </div>
                </div>
                <div className="w-[25%] max-sm:w-[40%]" >
                    <img  src={blog.image} alt="" />
                </div> 

 
            </div>
      
        </Link>
    )) : <h1>data not found</h1>
}
    </div>

  )
}

export default DisplayBlog