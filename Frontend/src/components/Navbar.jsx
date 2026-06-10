import { Link, Outlet, useNavigate } from "react-router-dom"
import logo from '../assets/logo.svg'
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { logout } from "../utils/userSlice"

const Navbar = () =>{
    const {token, name, username, profilePic} = useSelector(slice=> slice.user)
    const [userPopup, setUserPopup] = useState(false)
    const [userSearch , setUserSearch] = useState(null)
    const [page, setPage] = useState(1)
    const [showSearch, setShowSearch] = useState(true)
    const dispatch = useDispatch()
    const navigate= useNavigate()

    async function handleUserPopup(){
        setUserPopup((prev)=> !prev)
        
    }

    async function handleSearch(e) {
        if(e.key === 'Enter'){
        navigate(`/search?q=${userSearch}`)
        setUserSearch("")
        }
        
    
    }

    async function handleLogout(){
       dispatch(logout())
       navigate('/')
    }


   

    return (
        <>
        <div className=" text-center text-3xl p-3 bg-white shadow-xl max-w-[100vw]">
            <div className="flex justify-between w-full">
                 <div className="flex  items-center gap-5 w-[50%] max-sm:relative">
                    <div >
                    <Link to={'/'}>
                    <img src={logo} alt="" />
                    </Link>
                    </div>



                       <div className="relative">
                            <i className="fi fi-rr-search absolute right-2 top-3 max-sm:-top-3 max-sm:left-2 max-sm:mt-1 text-xl text-gray-400" onClick={()=> setShowSearch((prev)=> !prev)}></i>
                            
                       
                          <input value={userSearch? userSearch : ""} onChange={(e)=> setUserSearch(e.target.value) } onKeyDown={(e)=> handleSearch(e)} type="text" placeholder="search..." className={`p-2 focus:outline-none rounded-full text-xl bg-slate-200 max-sm:absolute max-sm:top-10 max-sm:w-[70vw] max-sm:-ml-14 sm:inline ${
                          showSearch ? "inline" : "hidden" 
                           }`}/>
                             
                         
                             </div>
    

                 </div>


  
                 <div className="flex justify-center items-center gap-3">
                    {token?  (
                        <>
                        <Link to={"/add-blog"}>
                    <div className="flex justify-center items-center gap-2">
                        <i className="fi fi-rr-edit text-xl mt-2"></i>
                        <p className="text-2xl max-sm:hidden">write</p>
                    </div>
                    </Link>
                     {/* <p className="text-2xl">{name}</p>  */}
                    
                    <div>

                      <div className="w-10 h-10" onClick={handleUserPopup}>
                    <img
                    className="rounded-xl w-full h-full"
                    src={`${profilePic? profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`}`}

                    alt=""
                    />
                   </div>
                      
                   {
                    userPopup ? <div className="bg-slate-100 w-28 absolute right-2 top-14 border rounded-xl z-10" onMouseLeave={()=> setUserPopup(false)}>
                        <Link to={`/@${username}`}>
                       <p className="text-xl p-1 hover:bg-blue-400 hover:text-white cursor-pointer rounded-t-xl">Profile</p>
                       </Link>

                       <Link to={`/setting`}>
                       <p className="text-xl p-1 hover:bg-blue-400 hover:text-white cursor-pointer ">setting</p>
                       </Link>

                       <p className="text-xl p-1 hover:bg-blue-400 hover:text-white cursor-pointer rounded-b-xl" onClick={handleLogout}
                       >Logout</p>

                       <Link to={`/edit-profile`}>
                       <p className="text-xl p-1 hover:bg-blue-400 hover:text-white cursor-pointer rounded-b-xl"
                       >Edit Profile</p>
                       </Link>
                       
                   </div> : ""
                   }

                   
                    </div>
                   

                     </> ): (<>
                    <Link to={"/add-blog"}>
                    <div className="flex justify-center items-center gap-2">
                        <i className="fi fi-rr-edit text-xl mt-2"></i>
                        <p className="text-2xl max-sm:hidden">write</p>
                    </div>
                    </Link>


                    <Link to={'signup'}>
                    <div className="text-2xl rounded-xl p-2 bg-blue-600 text-white max-sm:p-1 max-sm:text-sm">  
                        <button  className="mb-1">Signup</button>

                    </div>
                    </Link>

                    <Link to={"signin"}>
                    <div className="text-2xl rounded-xl p-2 bg-slate-100 border border-black max-sm:p-1 max-sm:text-sm">  
                        <button  className="mb-1  ">Signin</button>

                    </div>
                    </Link>
                    </>

                    )} 
                       
                </div>


            </div>
          
        </div>
       <Outlet/>
        </>

    )
}

export default Navbar