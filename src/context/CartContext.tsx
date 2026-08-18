'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
 id: string;
 title: string;
 price: number;
 image: string;
 quantity: number;
 seller: string;
 sellerId: string;
 stock: number;
}

interface CartContextType {
 items: CartItem[];
 addToCart: (product: Omit<CartItem, 'quantity'>) =>void;
 removeFromCart: (id: string) =>void;
 updateQuantity: (id: string, quantity: number) =>void;
 clearCart: () =>void;
 totalItems: number;
 totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
 const [items, setItems] = useState<CartItem[]>([]);

 useEffect(() =>{
 const saved = localStorage.getItem('eguriro-cart');
 if (saved) setItems(JSON.parse(saved));
 }, []);

 useEffect(() =>{
 localStorage.setItem('eguriro-cart', JSON.stringify(items));
 }, [items]);

 const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) =>{
 setItems(prev =>{
 const existing = prev.find(i =>i.id === product.id);
 if (existing) {
 return prev.map(i =>i.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i);
 }
 return [...prev, { ...product, quantity: 1 }];
 });
 }, []);

 const removeFromCart = useCallback((id: string) =>{
 setItems(prev =>prev.filter(i =>i.id !== id));
 }, []);

 const updateQuantity = useCallback((id: string, quantity: number) =>{
 if (quantity <= 0) { removeFromCart(id); return; }
 setItems(prev =>prev.map(i =>i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i));
 }, [removeFromCart]);

 const clearCart = useCallback(() =>setItems([]), []);

 const totalItems = items.reduce((sum, i) =>sum + i.quantity, 0);
 const totalPrice = items.reduce((sum, i) =>sum + i.price * i.quantity, 0);

 return (
 <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
 {children}
 </CartContext.Provider>
);
}

export function useCart() {
 const ctx = useContext(CartContext);
 if (!ctx) throw new Error('useCart must be used within CartProvider');
 return ctx;
}
