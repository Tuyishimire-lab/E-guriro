import { Suspense } from 'react';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
 return (
 <Suspense fallback={<div className="container" style={{ padding: '32px 24px', color: 'var(--text-muted)' }}>Loading checkout...</div>}>
 {children}
 </Suspense>
);
}
