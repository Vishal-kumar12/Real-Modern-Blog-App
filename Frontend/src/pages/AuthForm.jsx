import { useEffect, useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { login } from "../utils/userSlice"
import Input from "./Input"
import { googleAuth, handleRedirectResult } from "../utils/firebase"
import googleicon from "../assets/googleicon.svg"

function AuthForm({type}) {
const navigate = useNavigate()
    const dispatch = useDispatch()
     const [userData ,setUserData] = useState({name:"", email:"", password:""})
        async function handleSubmit(e){
            e.preventDefault()
         
            try {
    

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/${type}`, userData)
            


              if(type == 'signup'){
                toast.success(res.data.message)
                navigate("/signin")
            }else{
                dispatch(login(res.data.user))
               toast.success(res.data.message)
                navigate("/")
            }
            

            setUserData({
                name:"",
                email:"",
                password:""
            })
            } catch (error) {
                toast.error(error.response.data.message)
          
    
            }
          
        
    }


     
    async function handleGoogleAuth() {
        try {

            let userData = await googleAuth()
            if(!userData){
                return 
            }

             const idToken = await userData.getIdToken();

            let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`,
                {
                    accessToken: idToken
                }
            )
            dispatch(login(res.data.user))
            toast.success(res.data.message)
            navigate('/')
        } catch (error) {
              console.error("Google Auth Error:", error);
             toast.error(error.response?.data?.message || "Authentication failed");
        }
        
    }


   

    useEffect(() => {
    // Import the handleRedirectResult from your firebase utils
    const handleRedirect = async () => {
      try {
        const userData = await handleRedirectResult();
        if (userData) {
          const idToken = await userData.getIdToken();
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/google-auth`,
            {
              accessToken: idToken,
            }
          );
          dispatch(login(res.data.user));
          toast.success(res.data.message);
          navigate("/");
        }
      } catch (error) {
        console.error("Redirect Error:", error);
        toast.error("Authentication failed");
      }
    };

    handleRedirect();
  }, []);


// dispatch, navigate

    useEffect(()=>{
           setUserData({
                name:"",
                email:"",
                password:""
            })
    },[type])






  return (
    <div className="flex justify-center items-center h-[650px] w-full bg-gray-100">
        <form action="" className="flex flex-col items-center border border-black min-w-[25%] gap-5 p-5 max-sm:p-2 rounded-xl">
            <h1 className="text-3xl max-sm:text-2xl">{type== "signup"?" Sign Up" : "Sign In"}</h1>
            {
                type=="signup" && (
           
            <Input type={"text"} placeholder={"Enter Your Name"} setUserData={setUserData} key2={"name"} icon={"fi-br-user"} val={userData.name}/>
         
                )
            }

         

             <Input type={"text"} placeholder={"Enter Your Email"} setUserData={setUserData} key2={"email"} icon={"fi-rr-envelope"} val={userData.email}/>
          
            <Input type={"password"} placeholder={"Enter Your password"} setUserData={setUserData} key2={"password"}  icon={"fi-rr-lock"} val={userData.password}/>
            
           

           <button onClick={handleSubmit} className="focus:outline w-[50%] p-2 text-xl  border border-black rounded-xl">{type=="signup" ?"Register" : "signin"}</button>

            <p className="text-xl font-semibold">or</p>
           <div onClick={handleGoogleAuth}>
             <div className="display flex items-center gap-2 border rounded-xl p-2">
                <p className="text-xl ">Continue With Google</p>
                <div className="w-6 mt-1">
                    <img src={googleicon} alt="" />
                </div>
             </div>
           </div>

     {type=="signin" ? <p>Don`t have an account <Link to={'/signup'}>signup</Link></p> : <p>Already have an account <Link to={'/signin'}>signin</Link></p>}

        </form>

    </div>
  )
}

export default AuthForm