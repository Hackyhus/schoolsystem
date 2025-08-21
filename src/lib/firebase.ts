// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGaM7dKTaYAAx159WjlENGASvUoQhXh-c",
  authDomain: "haschat-31cbd.firebaseapp.com",
  projectId: "haschat-31cbd",
  storageBucket: "haschat-31cbd.appspot.com",
  messagingSenderId: "419048730722",
  appId: "1:419048730722:web:68ec923496b3046430613b",
  measurementId: "G-MXHEHWDHKF"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, db, auth, storage, analytics };
