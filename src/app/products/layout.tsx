import { Suspense } from 'react';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
 return (
 <Suspense fallback={<div className="container" style={{ padding: '32px 24px', color: 'var(--text-muted)' }}>Loading products...</div>}>
 {children}
 </Suspense>
);
}
