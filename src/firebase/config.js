// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAw2gKwTiGdHmA7Y2sFLGGZXOvT0qBnV8c",
  authDomain: "devflow-6f814.firebaseapp.com",
  projectId: "devflow-6f814",
  storageBucket: "devflow-6f814.firebasestorage.app",
  messagingSenderId: "1077279776175",
  appId: "1:1077279776175:web:42130f76034a93f45be35a",
  measurementId: "G-E1VTEJ7DJZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);