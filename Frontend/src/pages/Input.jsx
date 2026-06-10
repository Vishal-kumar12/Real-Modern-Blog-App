import React, { useState } from 'react'

function Input({type, placeholder, setUserData, key2, icon, val}) {
    const [showpass, setShowPass] = useState(false)
  return (
    <div className='w-full relative'>
            <i className={`fi ${icon} absolute mt-3 opacity-50 ml-1`}></i>
             <input
              type={type!= "password" ? type : showpass? "text": type}
              value={val}
              onChange={(e)=> setUserData(prev=> ({...prev, [key2]:e.target.value}))}
             placeholder={placeholder} 
             className="focus:outline w-full p-2 text-xl rounded-xl pl-9"/>
             {
                type=="password" &&(
                showpass ? <i onClick={()=> setShowPass((prev)=> !prev)} className="fi fi-rr-eye absolute right-0 mt-3 mr-1"></i> : <i onClick={()=> setShowPass((prev)=> !prev)} className="fi fi-rs-crossed-eye absolute right-0 mt-3 mr-1"></i>   
             )
            }
    </div>

  )
}

export default Input

