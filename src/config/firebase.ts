import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyByymZEOJjcuSplU5gCcUTJMHFlowL072E",
  authDomain: "evopos-store.firebaseapp.com",
  databaseURL: "https://evopos-store-default-rtdb.firebaseio.com",
  projectId: "evopos-store",
  storageBucket: "evopos-store.firebasestorage.app",
  messagingSenderId: "39408921137",
  appId: "1:39408921137:web:d2cae0da7dfa5352cc8310",
  measurementId: "G-HSPQJ33QJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const realtimeDb = getDatabase(app);

// Export app as default
export default app; 