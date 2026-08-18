import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
 apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
 authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'e-guriro.firebaseapp.com',
 projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'e-guriro',
 storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'e-guriro.appspot.com',
 messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
 appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
