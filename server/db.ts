import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

const firebaseConfig = {
  apiKey: "AIzaSyBiZCIkNEAaoYkpMYa5j4m7lXZ3EX71V48",
  authDomain: "ai-saathi-db.firebaseapp.com",
  databaseURL: "https://ai-saathi-db-default-rtdb.firebaseio.com",
  projectId: "ai-saathi-db",
  storageBucket: "ai-saathi-db.firebasestorage.app",
  messagingSenderId: "508445017134",
  appId: "1:508445017134:web:25d939201c31d1a3a18bbf",
  measurementId: "G-CP8VVG1KYZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
