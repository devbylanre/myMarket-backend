import dotenv from 'dotenv';
dotenv.config();

export default {
  port: parseInt(process.env.PORT as string, 10),
  mongoDB: process.env.MONGODB_DRIVER as string,
  secretKey: process.env.SECRET_KEY as string,
  client: process.env.CLIENT as string,
  gmail: {
    user: process.env.GMAIL_USER as string,
    password: process.env.GMAIL_PASSWORD as string,
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY as string,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.FIREBASE_SENDER_ID as string,
    appId: process.env.FIREBASE_APP_ID as string,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID as string,
  },
};
