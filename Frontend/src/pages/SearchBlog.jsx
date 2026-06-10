import axios from 'axios'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import DisplayBlog from '../components/DisplayBlog'
import toast from 'react-hot-toast'
import usePagination from '../hooks/usePagination'


function SearchBlog() {
  const location = useLocation()
  const {tagName} = useParams()
   const [searchParams, setSearchParams] = useSearchParams()
   const searchQuery = searchParams.get('q')
   const [page, setPage] = useState(1)
 

  const {searchBlogs, hasMore} = usePagination({tagName: tagName, searchQuery: searchQuery}, "search-blogs", page, 5)

  useEffect(()=>{
  
    if(!hasMore){
      setPage(1)
    }

  },[searchQuery])
  return (
    <div className="max-w-screen-sm max-md:w-[90%] max-lg:w-[70%] max-md: mx-2  md:mx-auto mt-3 max-sm:mt-14">
  
      {
        searchBlogs.length !== 0 ? 
        <>
        <span className='text-5xl max-sm:text-2xl font-bold opacity-50'>Results for </span><span className='text-5xl max-sm:text-2xl font-bold'>{tagName == undefined? searchQuery : tagName}</span>
        <DisplayBlog blogs={searchBlogs}/> 
         { hasMore &&
         
        <button onClick={()=> setPage((prev)=> prev + 1 )} className="text-xl bg-blue-500 text-white rounded-xl p-2 mt-2">Load More</button> 
       
         }
        </> : <h1 className='text-xl'>No result Found related to this search please explain in detail what you want!</h1>

        
      }

        
           

            
         

        </div>
  )
}

export default SearchBlog