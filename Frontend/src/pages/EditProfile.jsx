import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useParams } from 'react-router-dom'
import { login } from '../utils/userSlice'
import { useEffect } from 'react'

function EditProfile() {
    const {name, profilePic, username, bio, userId, token, email} = useSelector(state=> state.user)
  
   
    const [isButtonDisabled, setIsButtonDisabled] = useState(true)
    const [initialData, setInitialData] = useState({
         name:name,
        profilePic: profilePic,
        username: username,
        bio:bio
    })



    const [userdata, setUserData] = useState({
         name:name,
        profilePic: profilePic,
        username: username,
        bio:bio
    })
    const formData = new FormData()
   const dispatch = useDispatch()
    async function handleChange(e){
        if(e.target.files){
             setUserData((prev) => ({...prev, [e.target.name]: e.target.files[0]}))
             
        }else{
             setUserData((prev) => ({...prev, [e.target.name]: e.target.value}))
        }
       
    }




   async function updateUser() {
    formData.append("name", userdata.name)
    formData.append("username", userdata.username)
    formData.append("profilePic", userdata.profilePic)
    formData.append("bio", userdata.bio)
    
  
  
    try {

    const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
     formData,
      {
        headers:{
             "Content-Type": "multipart/form-data",
          
        }
      }
    )

      toast.success(res.data.message)
      dispatch(login({...res.data.user, token, email, userId}))
    } catch (error) {
        toast.error(error.response.data.message)
    }
  }

  useEffect(()=>{
    if(initialData){
      let isEqual = JSON.stringify(initialData) === JSON.stringify(userdata)
      setIsButtonDisabled(isEqual)
    }
  }, [initialData, userdata])

  return (
   
   
    <>
    {
      token ? (
    <div className="w-screen  max-sm:mt-12">
    <div className="max-sm:w-[70%] max-lg:w-[60%]  w-[50%] m-auto  mt-2 p-2">
      <div className="my-2">
        <h1 className="text-2xl">Name</h1>
        <input
        name='name'
        type="text"
        placeholder="name..."
        defaultValue={userdata.name}

        onChange={(e)=> handleChange(e)}
        className="w-full p-2 my-2 placeholder:text-xl focus:outline-none border text-xl"

      />
      </div>
      
      

    <div>
        <h1 className="text-2xl mt-2">ProfileImage</h1>

      <label htmlFor="image" className="">
      
           { userdata.profilePic ?<>
           <div className="rounded-xl">
                  <img  src={typeof(userdata.profilePic) == "string" ? userdata.profilePic : URL.createObjectURL(userdata.profilePic)} className="aspect-video object-cover rounded-xl w-[30%]" alt="" /> 
           </div>
           </>
           : <div className="border w-[30%] aspect-video flex justify-center items-center text-xl bg-white rounded-xl">Select Image</div>
           }
      </label>
      <input
      name='profilePic'
      className="hidden"
        type="file"
        id="image"
       
        onChange={(e)=> handleChange(e)}
      />
        
         
            <button onClick={()=> setUserData((prev)=>( {...prev, profilePic: null }))}
            className='text-2xl bg-red-400 p-1 mt-1 rounded-xl  text-white text-center hover:cursor-pointer'>
        remove
      </button>

      </div>




     <div className="my-2">
        <h1 className="text-2xl">username</h1>
        <input
        name='username'
        type="text"
        placeholder="username..."
     
        defaultValue={userdata.username}

        onChange={(e)=> handleChange(e)}
        className="w-full p-2 my-2 placeholder:text-xl focus:outline-none border text-xl"

      />
      </div>
      

    
    <div>
        <h1 className="text-2xl">bio</h1>

        <textarea 
        name='bio'
        type="text" 
         placeholder="Enter bio"
       
        defaultValue={userdata.bio}
        onChange={(e)=> handleChange(e)}
        className=" w-full focus:outline-none tex-xl p-2  border rounded-xl resize-none my-2"
        />

    </div>

    
      
     
      
      <button 
       onClick={updateUser}
       disabled={isButtonDisabled}
       className={` text-white p-2 rounded-xl border text-2xl  ${isButtonDisabled? 'bg-blue-100' :  'bg-blue-700'}`}>
        update user
      </button>
      

    </div>

    </div> ) : <Navigate to={'/signin'}/>
     }
     </>
  )
}

export default EditProfile