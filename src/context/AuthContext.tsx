'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
 uid: string;
 name: string;
 email: string;
 role: 'buyer' | 'seller' | 'admin';
 district?: string;
 phone?: string;
 shopName?: string;
}

interface AuthContextType {
 user: User | null;
 loading: boolean;
 login: (email: string, password: string) =>Promise<void>;
 register: (data: RegisterData) =>Promise<void>;
 logout: () =>void;
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

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: User[] = [
 { uid: 'admin1', name: 'Admin E-guriro', email: 'admin@eguriro.rw', role: 'admin' },
 { uid: 'seller1', name: 'Jean Pierre', email: 'seller@eguriro.rw', role: 'seller', shopName: 'TechHub Kigali', district: 'Gasabo', phone: '0788123456' },
 { uid: 'buyer1', name: 'Amina Uwase', email: 'buyer@eguriro.rw', role: 'buyer', district: 'Kicukiro', phone: '0722987654' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() =>{
 const saved = localStorage.getItem('eguriro-user');
 if (saved) setUser(JSON.parse(saved));
 setLoading(false);
 }, []);

 const login = async (email: string, _password: string) =>{
 const found = MOCK_USERS.find(u =>u.email === email);
 if (!found) throw new Error('Invalid email or password');
 setUser(found);
 localStorage.setItem('eguriro-user', JSON.stringify(found));
 };

 const register = async (data: RegisterData) =>{
 const newUser: User = {
 uid: `user_${Date.now()}`,
 name: data.name,
 email: data.email,
 role: data.role,
 phone: data.phone,
 shopName: data.shopName,
 district: data.district,
 };
 setUser(newUser);
 localStorage.setItem('eguriro-user', JSON.stringify(newUser));
 };

 const logout = () =>{
 setUser(null);
 localStorage.removeItem('eguriro-user');
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
