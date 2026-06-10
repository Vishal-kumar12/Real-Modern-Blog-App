import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { handleSaveBlog } from '../components/Homepage'
import { useDispatch, useSelector } from 'react-redux'
import formatDate from '../utils/formatDate'
import DisplayBlog from '../components/DisplayBlog'
import toast from 'react-hot-toast'
function Userprofile() {
  const [blogs, setBlogs] = useState([])
  const {token, userId, username:loginUsername, name, bio, profilePic} = useSelector(state=> state.user)

   const [userData, setUserData]= useState(null)
   const location = useLocation()
  

  let {username} = useParams()

  async function fetchUserProfile() {
   try {
   
    let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${username}`)
    setUserData(res.data.user)

     setBlogs(res.data.user.blogs)
  
   } catch (error) {
   }
    
  }




 function HandleDisplayBlog(){
  if(location.pathname === `/${username}`){
     return <DisplayBlog blogs={blogs}/>
  }
  else if(location.pathname === `/${username}/liked-blogs`){

    if(userData.showLikeBlogs || userData._id == userId){

    
     return <DisplayBlog blogs={userData.likeBlogs}/>
    }
     
  }
   else if(location.pathname === `/${username}/saved-blogs`){
    if(userData.showSavedBlogs || userData._id == userId){

    
    return <DisplayBlog blogs={userData.savedBlogs}/>
    }
   
    
  }
   else if(location.pathname === `/${username}/draft-blogs`){
    if(userData._id == userId ){
         return <DisplayBlog blogs={userData.blogs.filter((blog)=> blog.draft)}/>
    }
    
  
  }
  
}


 useEffect(()=>{
  
  fetchUserProfile()


  
 },[username])

  return (
    <div className='max-lg:max-w-screen  lg:w-[80%] mx-auto flex max-md:flex-col-reverse md:relative max-sm:top-12 '>
      <div className='max-w-full md:w-[70%] max-sm:p-0 max-lg:p-1 lg:px-10 pt-5 '>
        <div className='flex justify-between'>
          <p className='max-sm:text-xl text-2xl font-semibold'>{name}</p>
         <i className="fi fi-rs-menu-dots"></i>
        </div>
        

        <div className='flex  gap-5 opacity-50 mt-5'>
          {
            userData ? <>
          <Link to={`/@${userData.username}`}   className={`${location.pathname === `/${username}` ? "border-b-2 border-black": ""} `}>
           <p className='border-b-2 hover:border-b-2 hover:border-black'>Home</p>
          </Link>


          {
             userData.showLikeBlogs?
          

           <Link to={`/@${userData.username}/liked-blogs`} className={`${location.pathname === `/${username}/liked-blogs` ? "border-b-2 border-black": ""} `}>
           <p className='border-b-2 hover:border-b-2 hover:border-black'>liked <span className='max-sm:hidden'>-blogs</span></p>
          </Link> : "" 
          } 


          {
            userData.showSavedBlogs ? 
          

           <Link to={`/@${userData.username}/saved-blogs`} className={`${location.pathname === `/${username}/saved-blogs` ? "border-b-2 border-black": ""} `}>
           <p className='border-b-2 hover:border-b-2 hover:border-black'>saved <span className='max-sm:hidden'>-blogs</span></p>
          </Link> : ""
          
          }
          

          {
            userData._id == userId && 
         
           <Link to={`/@${userData.username}/draft-blogs`} className={`${location.pathname === `/${username}/draft-blogs` ? "border-b-2 border-black": ""} `}>
           <p className='border-b-2 hover:border-b-2 hover:border-black'>draft <span className='max-sm:hidden'>-blogs</span></p>
          </Link>
          
          }
          
         </> : ""
          }
   
          
        </div>
       
       <hr className='mt-2'/>
       
     
    


      {
        HandleDisplayBlog()
      }

     


      </div>

    {
      userData ?
    
      <div className='max-w-full md:w-[calc(100%-70%)] lg:w-[50%] max-h-screen md:sticky md:top-0 border'>
        <div className='max-sm:p-1 max-lg:p-2 lg:p-5 flex flex-col gap-3'>
          <div className="w-16 h-14 ">
                    <img
                    className="rounded-full"
                    src={`${userData?.profilePic? userData?.profilePic: `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`}`}
                    alt=""
                    />
        </div>
        <p className='text-xl font-semibold '>{userData?.name}</p>
        <p className='opacity-60'>{userData?.followers?.length} followers</p>
        <p className='opacity-60'>{userData?.bio}</p>

      

          {username.split("@")[1] === loginUsername?  
        <Link to={`/edit-profile`}>       
        <button className="text-xl rounded-xl border bg-green-400 text-white  p-2 max-md:hidden">
               
              Edit Profile
              </button>
        </Link> 
         : ""}
        
        <div className='mt-2 border p-2 hidden md:block'>
          <p className='text-xl font-semibold'>following</p>

         
       
      

          {
            userData.following.length !== 0 ? 
           userData.following.map((singleUserData, id)=> (

             <div key={id} className='mt-2 overflow-y-scroll scrollbar-hide '>
        
        <div className='flex justify-between items-center mt-2'>
         
          <div className='flex gap-2 items-center'>
            <Link to={`/@${singleUserData.username}`}>
             <div className="w-8 h-8 " >
                    <img
                    className="rounded-xl"
                    src={`${singleUserData.profilePic? singleUserData.profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${singleUserData.name}`}`}
                    alt=""
                    />
              
        </div>
        </Link>

        
        
        <Link to={`/@${singleUserData.username}`}>

            <p>{singleUserData.name}</p>

        </Link>

          </div>
          
       
        <i className="fi fi-rs-menu-dots"></i>
        </div>


        </div>) 
           )
            :  ""
          }
          
       

        </div>
       
        </div>

      </div> : <h1>Loading...</h1>
    }


    </div>
  )
}

export default Userprofile