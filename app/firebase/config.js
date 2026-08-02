import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, memoryLocalCache } from "firebase/firestore";

const _apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY
const _authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
const _projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
const _storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET
const _messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID
const _appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
const firebaseConfig = {
  apiKey: _apiKey,
  authDomain: _authDomain ,
  projectId: _projectId,
  storageBucket: _storageBucket,
  messagingSenderId: _messagingSenderId,
  appId: _appId,
};

// // Debug logging
// console.log('🔥 Firebase Config Debug:');
// console.log('API Key:', _apiKey);
// console.log('Auth Domain:', _authDomain);
// console.log('Project ID:', _appId);
// console.log('All config keys:', Object.keys(firebaseConfig));
// console.log('Config values defined:', Object.values(firebaseConfig).every(v => v !== undefined));

// // Add this to your firebase config file temporarily
// console.log('=== ENVIRONMENT DEBUG ===');
// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('Platform:', process.platform);
// console.log('');

// console.log('=== ALL ENVIRONMENT VARIABLES ===');
// const allEnvVars = Object.keys(process.env).sort();
// console.log('Total env vars:', allEnvVars.length);
// allEnvVars.forEach(key => {
//   if (key.includes('FIREBASE') || key.includes('NEXT_PUBLIC') || key.includes('DO_')) {
//     console.log(`${key}: ${process.env[key]?.substring(0, 20)}...`);
//   }
// });

// console.log('');
// console.log('=== FIREBASE SPECIFIC ===');
// console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
// console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// console.log('');
// console.log('=== ALTERNATIVE NAMES ===');
// console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY);
// console.log('FIREBASE_AUTH_DOMAIN:', process.env.FIREBASE_AUTH_DOMAIN);
// console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

// console.log('=== END DEBUG ===');

// Initialize Firebase for server-side rendering
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);



const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
