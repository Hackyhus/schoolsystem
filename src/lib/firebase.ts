
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics, isSupported } from "firebase/analytics";
import { FirebaseDatabaseService, IDatabaseService } from "@/services/databaseService";
import { FirebaseStorageService, IStorageService } from "@/services/storageService";
import { FirebaseAuthService, IAuthService }from '@/services/authService';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
  measurementId: "REPLACE_WITH_YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase SDK instances
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Conditionally initialize Analytics only on the client side
// const analytics = typeof window !== 'undefined' && isSupported().then(yes => yes ? getAnalytics(app) : null);
const analytics = null; // Disabled to prevent installation errors

// Abstracted Service Instances
const dbService: IDatabaseService = new FirebaseDatabaseService(db);
const storageService: IStorageService = new FirebaseStorageService(storage);
const authService: IAuthService = new FirebaseAuthService(auth);


export { app, db, auth, storage, analytics, dbService, storageService, authService };
