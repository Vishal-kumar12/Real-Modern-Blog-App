import { configureStore } from '@reduxjs/toolkit'
import userSlice from "./userSlice"
import selectedBlogSlice from './selectedBlogSlice'
import commentSlice from './commentSlice'
const store = configureStore({
    reducer:{
        user: userSlice,
        selectedBlog : selectedBlogSlice,
        Comment: commentSlice
       
    }
})

export default store