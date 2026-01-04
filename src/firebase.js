// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCQsSIeJvGelE415TohJRcfpJIViAxFVY0",
  authDomain: "ehlazeni-star-school.firebaseapp.com",
  databaseURL: "https://ehlazeni-star-school-default-rtdb.firebaseio.com",
  projectId: "ehlazeni-star-school",
  storageBucket: "ehlazeni-star-school.firebasestorage.app",
  messagingSenderId: "320678162570",
  appId: "1:320678162570:web:1a7cde57da929926a93d73",
  measurementId: "G-98GGSQBJYS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
