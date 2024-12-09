// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

export default function(){

  const firebaseConfig = {
    apiKey: "AIzaSyBxXUnSGANDAk879hSjAwVdpkFWCRPtK4g",
    authDomain: "moviescloud-b3964.firebaseapp.com",
    projectId: "moviescloud-b3964",
    storageBucket: "moviescloud-b3964.firebasestorage.app",
    messagingSenderId: "850160040140",
    appId: "1:850160040140:web:63be616a3656bbaba7ea69"
  };
  
      // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);      
    const db = getFirestore(app);   

    return {auth, db}
}


