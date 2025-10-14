// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { FirebaseDatabaseService, IDatabaseService } from "@/services/databaseService";
import { FirebaseStorageService, IStorageService } from "@/services/storageService";
import { FirebaseAuthService, IAuthService } from "@/services/authService";

// Your web app's Firebase configuration
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

// Firebase SDK instances
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Conditionally initialize Analytics only on the client side
const analytics = typeof window !== 'undefined' && isSupported().then(yes => yes ? getAnalytics(app) : null);

// Abstracted Service Instances
const dbService: IDatabaseService = new FirebaseDatabaseService(db);
const storageService: IStorageService = new FirebaseStorageService(storage);
const authService: IAuthService = new FirebaseAuthService(auth);


export { app, db, auth, storage, analytics, dbService, storageService, authService };
