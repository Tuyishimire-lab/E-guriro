'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  district?: string;
  phone?: string;
  shopName?: string;
  avatarUrl?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
  phone?: string;
  shopName?: string;
  district?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Persist a safe user snapshot to the cookie so the proxy can read the role */
function persistCookie(user: User | null) {
  if (user) {
    const encoded = encodeURIComponent(JSON.stringify(user));
    document.cookie = `eguriro-user=${encoded}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = 'eguriro-user=; path=/; max-age=0';
  }
}

/** Read the Firestore user document and return our User shape */
async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<User | null> {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid:       firebaseUser.uid,
    name:      data.name ?? firebaseUser.displayName ?? 'User',
    email:     firebaseUser.email ?? '',
    role:      data.role ?? 'buyer',
    district:  data.district,
    phone:     data.phone,
    shopName:  data.shopName,
    avatarUrl: data.avatarUrl ?? firebaseUser.photoURL ?? undefined,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Firebase Auth state listener — source of truth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await fetchUserProfile(firebaseUser);
          setUser(profile);
          persistCookie(profile);
        } catch {
          // Firestore not accessible yet (e.g. offline) — build minimal user
          const minimal: User = {
            uid:   firebaseUser.uid,
            name:  firebaseUser.displayName ?? 'User',
            email: firebaseUser.email ?? '',
            role:  'buyer',
          };
          setUser(minimal);
          persistCookie(minimal);
        }
      } else {
        setUser(null);
        persistCookie(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle state + cookie update
    // But also eagerly update so pages don't wait
    const profile = await fetchUserProfile(cred.user);
    if (profile) {
      setUser(profile);
      persistCookie(profile);
    }
  };

  // ── register ───────────────────────────────────────────────────────────────
  const register = async (data: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

    // Set display name on Firebase Auth
    await updateProfile(cred.user, { displayName: data.name });

    // Build Firestore user document
    const userDoc: Record<string, unknown> = {
      uid:       cred.user.uid,
      name:      data.name,
      email:     data.email,
      role:      data.role,
      createdAt: serverTimestamp(),
      status:    data.role === 'seller' ? 'pending' : 'active',
    };
    if (data.phone)     userDoc.phone     = data.phone;
    if (data.shopName)  userDoc.shopName  = data.shopName;
    if (data.district)  userDoc.district  = data.district;

    await setDoc(doc(db, 'users', cred.user.uid), userDoc);

    // If seller, also create a seller profile document
    if (data.role === 'seller' && data.shopName) {
      await setDoc(doc(db, 'sellers', cred.user.uid), {
        uid:        cred.user.uid,
        name:       data.name,
        email:      data.email,
        shopName:   data.shopName,
        district:   data.district ?? 'Gasabo',
        phone:      data.phone ?? '',
        rating:     0,
        products:   0,
        verified:   false,
        status:     'pending',
        createdAt:  serverTimestamp(),
      });
    }

    const profile: User = {
      uid:      cred.user.uid,
      name:     data.name,
      email:    data.email,
      role:     data.role,
      district: data.district,
      phone:    data.phone,
      shopName: data.shopName,
    };
    setUser(profile);
    persistCookie(profile);
  };

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    persistCookie(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
