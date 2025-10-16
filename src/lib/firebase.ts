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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
