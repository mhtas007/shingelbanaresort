import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqpd9OH1Bl7oVtHf9SQNCTt5o7c4oHmRc",
  authDomain: "shingelbanarest.firebaseapp.com",
  projectId: "shingelbanarest",
  storageBucket: "shingelbanarest.firebasestorage.app",
  messagingSenderId: "705453097742",
  appId: "1:705453097742:web:4cb7c3a3395bd23041cd5f"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
export const auth = getAuth(app);