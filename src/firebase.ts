// Firebase ready — optional. App runs in DEMO MODE without keys.
// Production ku: .env fill panni `npm i firebase` pannunga, pinna itha use pannunga.
//
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
//
// const cfg = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };
// export const firebaseReady = Boolean(cfg.apiKey);
// export const app = cfg.apiKey ? initializeApp(cfg) : null;
// export const auth = app ? getAuth(app) : null;
// export const db = app ? getFirestore(app) : null;

export const firebaseReady = false;
export const app = null;
export const auth = null;
export const db = null;
