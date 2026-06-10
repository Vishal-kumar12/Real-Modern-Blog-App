import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"

// const firebaseConfig = {
// // Import the functions you need from the SDKs you need
//   apiKey: import.meta.env.VITE_APIKEY,

//   authDomain: import.meta.env.VITE_AUTHDOMAIN,
//   projectId: import.meta.env.VITE_PROJECTID,
//   storageBucket: import.meta.env.VITE_STORAGEBUCKET,
//   messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
//   appId: import.meta.env.VITE_APPID
// };








const firebaseConfig = {
  apiKey : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// const firebaseConfig = {
//   apiKey : "AIzaSyATOjT_jyUi1abb92LATOsu2ezx6RdJJ_8",
//   authDomain: "realmodernblogapp.firebaseapp.com",
//   projectId: "realmodernblogapp",
//   storageBucket: "realmodernblogapp.firebasestorage.app",
//   messagingSenderId: "679404268936",
//   appId: "1:679404268936:web:c126cfa2373cba2c049e3"
// };


// Initialize Firebase
// firebaseConfig
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

// Import the functions you need from the SDKs you need

   


export async function googleAuth(){
    try {
        let data = await signInWithPopup(auth, provider)
        return data.user
    } catch (error) {
        console.log(error)
    }
}