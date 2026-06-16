import React, { useEffect } from 'react'
import toast  from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'


function VerifyUser() {
    const navigate = useNavigate()
    const {verificationToken} = useParams()
    async function verifyUserUsingEmail(){
             try {
            let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify-email/${verificationToken}`)
            toast.success(res.data.message)

            // navigate('/signin')
            

        } catch (error) {
            toast.error(error.response.data.message)
        }
    }
    useEffect(()=>{

     
    verifyUserUsingEmail()
    }, [verificationToken])
  return (
    <div>VerifyUser</div>
  )
}

export default VerifyUser