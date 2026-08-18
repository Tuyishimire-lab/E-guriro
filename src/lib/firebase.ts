/**
 * Firebase — Auth only.
 * All data storage handled by Vercel (Postgres, KV, Blob, Edge Config).
 *
 * Guard: Firebase is only initialized when NEXT_PUBLIC_FIREBASE_API_KEY is present.
 * This prevents build-time prerender failures when env vars aren't yet set on Vercel.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;

if (apiKey) {
  app = getApps().length === 0
    ? initializeApp({
        apiKey,
        authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      })
    : getApp();
  _auth = getAuth(app);
}

/**
 * Firebase Auth instance.
 * Will be null during SSR/build if NEXT_PUBLIC_FIREBASE_API_KEY is not set.
 * All usages are inside 'use client' components so this is always defined at runtime.
 */
export { _auth as auth };
