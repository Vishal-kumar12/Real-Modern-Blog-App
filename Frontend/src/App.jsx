import { Route, Routes } from 'react-router-dom'
import './App.css'
import AuthForm from './pages/AuthForm'
import Homepage from './components/Homepage'
import Navbar from './components/Navbar'
import AddBlog from './pages/AddBlog'
import BlogPage from './pages/BlogPage'
import VerifyUser from './pages/VerifyUser'
import Userprofile from './pages/Userprofile'
import EditProfile from './pages/EditProfile'
import SearchBlog from './pages/SearchBlog'
import Setting from './pages/Setting'



function App() {
  return (
    <div className=''>
      <Routes>
        <Route path='/' element={<Navbar/>}>
        <Route path='/' element={<Homepage/>}></Route>
        <Route path='/signup' element={<AuthForm type={"signup"}/>}></Route>
        <Route path='/signin'element={<AuthForm type={"signin"}/>}></Route>
        <Route path='/add-blog' element={<AddBlog/>}></Route>
        <Route path='/blog/:blogId' element={<BlogPage/>}></Route>
        <Route path='/edit-blog/:id' element={<AddBlog/>}></Route>
        <Route path='/verify-email/:verificationToken' element={<VerifyUser/>}></Route>
        <Route path='/:username' element={<Userprofile/>}></Route>
        <Route path='/edit-profile' element={<EditProfile/>}></Route>
        <Route path='setting' element={<Setting/>}></Route>
        <Route path='/search' element={<SearchBlog/>}></Route>
        <Route path="/tag/:tagName" element={<SearchBlog/>}></Route>
        <Route path='/:username' element={<Userprofile/>}></Route>
        <Route path='/:username/saved-blogs' element={<Userprofile/>}></Route>
        <Route path='/:username/liked-blogs' element={<Userprofile/>}></Route>
        <Route path='/:username/draft-blogs' element={<Userprofile/>}></Route>
        </Route>
       
      </Routes>
    </div>
  )
}

export default App
// w-screen bg-slate-400