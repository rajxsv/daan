// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsPbCI02rhuUyFTg0jFJ0rrarUC-lps-I",
  authDomain: "daan-rn.firebaseapp.com",
  projectId: "daan-rn",
  storageBucket: "daan-rn.appspot.com",
  messagingSenderId: "921739183494",
  appId: "1:921739183494:web:1ad4dac9f78049176f9807"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Database structure for chat messages:
// chats (collection)
//  └─ chat_id (document)
//     ├─ messages (collection)
//     │  └─ message_id (document)
//     │     ├─ text (string)
//     │     ├─ timestamp (timestamp)
//     │     └─ userId (string)
//     └─ users (array of user IDs)