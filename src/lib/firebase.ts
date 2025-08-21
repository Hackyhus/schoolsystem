// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc1zl7ui6u6v2IsUmHkKtja_QzxcTXuVM",
  authDomain: "insightconnect-portal.firebaseapp.com",
  projectId: "insightconnect-portal",
  storageBucket: "insightconnect-portal.firebasestorage.app",
  messagingSenderId: "700555489196",
  appId: "1:700555489196:web:eaf2407490ff32ef0c5409",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
