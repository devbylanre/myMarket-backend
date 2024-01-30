import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  apiKey: process.env.FIREBASE_API_KEY as string,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.FIREBASE_SENDER_ID as string,
  appId: process.env.FIREBASE_APP_ID as string,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID as string,
};

const firebaseApp = initializeApp(config);
export const storage = getStorage(firebaseApp);
