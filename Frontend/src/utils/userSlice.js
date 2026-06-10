import { createSlice } from "@reduxjs/toolkit"


const userSlice = createSlice({
    name:"userSlice",
    initialState: JSON.parse(localStorage.getItem('user')) || {token: null},
    reducers:{
        login(state , action){
        
        
        localStorage.setItem('user', JSON.stringify(action.payload))
         return action.payload
        },

        logout(state, action){
          localStorage.removeItem('user')
          return {token: null}
        },

        updateLikedSavedVisibility(state, action){
            state = {...state, ...action.payload}
            return state
        },

      

       updateFollowing(state, action) {
    
        if (state.following.includes(action.payload)) {
        state.following = state.following.filter((save) => save != action.payload);
        } else {
        state.following = [...state.following, action.payload];
        }
     

      return state;
    },
    }
})

export const {login, logout, updateLikedSavedVisibility, updateFollowing} = userSlice.actions
export default userSlice.reducer