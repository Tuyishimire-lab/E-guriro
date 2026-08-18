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
import { auth } from '@/lib/firebase';

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function persistCookie(user: User | null) {
  if (user) {
    const encoded = encodeURIComponent(JSON.stringify(user));
    document.cookie = `eguriro-user=${encoded}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = 'eguriro-user=; path=/; max-age=0';
  }
}

/** Fetch user profile from Postgres via API route (client-safe) */
async function fetchProfile(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const res = await fetch(`/api/users/${firebaseUser.uid}`);
    if (!res.ok) return null;
    return await res.json() as User;
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser);
        const resolved: User = profile ?? {
          uid:   firebaseUser.uid,
          name:  firebaseUser.displayName ?? 'User',
          email: firebaseUser.email ?? '',
          role:  'buyer',
        };
        setUser(resolved);
        persistCookie(resolved);
      } else {
        setUser(null);
        persistCookie(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchProfile(cred.user);
    if (profile) { setUser(profile); persistCookie(profile); }
  };

  const register = async (data: RegisterData) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });

    // Write user + optional seller profile to Postgres via API route
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: cred.user.uid, ...data }),
    });
    if (!res.ok) throw new Error('Failed to save profile. Please contact support.');

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
