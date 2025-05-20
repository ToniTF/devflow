import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import config from './config';

// Initialize Firebase
const app = initializeApp(config);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { storage, firestore, auth };