import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { logout, updateLikedSavedVisibility } from '../utils/userSlice'

function Setting() {
  const {token, showLikeBlogs, showSavedBlogs, userId} = useSelector(state=> state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [data, setData] = useState({
    showLikeBlogs,
    showSavedBlogs
  })
 
  const [deleteAccount, setDeleteAccount] = useState(false)

  async function handleVisibility(){
    try {
      let res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/change-like-save-visibility`,
        data,
      {
        headers:{
           Authorization:`Bearer ${token}`
        }
      }
      )


      toast.success(res.data.message)
      dispatch(updateLikedSavedVisibility(data))
      navigate(-1)
    } catch (error) {
      toast.error(error.response.data.message)
    }
  
  }


  async function handleDeleteUserAccount(){
     try {
      
      let res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
        
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      toast.success(res.data.message)
      dispatch(logout())
      navigate('/')
     } catch (error) {
      toast.error(error.data.response.message)
     }
  }

  return (
    
      token ? 
        <div className='w-screen border border-black h-[calc(100vh-10vh)]'>
        
        <div className='w-[40%] max-md:w-[70%] max-lg:w-[50%] mx-auto border mt-36 p-2'>
 
         <h1 className="text-2xl font-semibold text-center text-slate-800 p-1 max-sm:text-xl">Settings</h1>
        

        <div className='w-full'>
        <h1 className="text-2xl text-center max-md:text-xl">Show liked Blogs</h1>

        <select value={data.showLikeBlogs} onChange={(e)=> setData((prev)=> ({...prev, showLikeBlogs: e.target.value === "true"? true: false}))} name="" id="" className=" w-full focus:outline-none tex-xl p-2  border rounded-xl  my-2">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        </div>


        <div className='w-full'>
        <h1 className="text-2xl text-center max-md:text-xl">Show Saved Blogs</h1>

           <select value={data.showSavedBlogs} onChange={(e)=> setData((prev)=> ({...prev, showSavedBlogs: e.target.value === "true"? true: false}))} name="" id="" className=" w-full focus:outline-none tex-xl p-2  border rounded-xl  my-2">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        </div>

     

     <div className='w-full text-center'>
       <button onClick={handleVisibility}
      
       className="bg-blue-700 shadow-sm shadow-blue-300 text-white p-2 rounded-xl border text-2xl max-md:text-xl">
        update
     </button>
     </div>

       <div className='w-full text-center p-2'>
       <button onClick={()=> setDeleteAccount((prev)=> !prev)}
      
       className="bg-green-400 shadow-sm shadow-blue-300 text-white p-2 rounded-xl border text-2xl max-md:text-xl">
        delete account
     </button>


      

           
       </div>
 

      {
        deleteAccount &&    (<div className='border'>
        <h1 className='text-xl '>Are you sure you want to delete this account? This action cannot be undone, and all your data will be permanently deleted.</h1>
        
        <div className='flex gap-2 justify-center items-center '>
          <button className=" p-2 text-2xl rounded-xl bg-green-400 text-white" onClick={handleDeleteUserAccount}>
                      yes
          </button>

           <button className=" p-2 text-2xl rounded-xl bg-red-400 text-white" onClick={()=> setDeleteAccount((prev)=> !prev)}> 
                      No
          </button>
        </div>

       </div>)
      }

    
      

      



      </div>
    

       



    

   
      
    </div>   : <Navigate to={'/signin'}/>

      
  )
}

export default Setting