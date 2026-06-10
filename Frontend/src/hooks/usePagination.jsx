import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {  useNavigate } from 'react-router-dom'

function usePagination({tagName, searchQuery},path, page, limit) {
     const [searchBlogs, setSearchBlogs] = useState([])
     const [hasMore, setHasMore] = useState(true)
     const navigate = useNavigate()
   
    async function fetchSearchedBlogs() {

   
    try {
        const params = {search:tagName == undefined? searchQuery : tagName, page, limit:limit }
    
        let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/${path}`,
          {params}
        )

   
    setSearchBlogs((prev)=> [...prev ,...res.data.blogs])

    setHasMore(res.data.hasMore)
 
  

    } catch (error) {
      navigate(-1)
      setHasMore(false)
      setSearchBlogs([])
      toast.error(error.response.data.message)
    }
  
   }
   
   useEffect(()=>{
    if(searchQuery && page == 1){
    setSearchBlogs(()=> [])

    }


   
    fetchSearchedBlogs()


   
   },[searchQuery, page])
  return {searchBlogs, hasMore}
}

export default usePagination