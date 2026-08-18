'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  UilShield, UilHome, UilPackage, UilStore, UilUser, UilMoneyBill,
  UilFire, UilCog, UilBars, UilSignOutAlt, UilGrid,
  UilExclamationTriangle, UilArrowRight,
} from '@/components/Icons';
import styles from './layout.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: string | number; className?: string; style?: React.CSSProperties }>;
  exact?: boolean;
  badge?: number;
}
interface NavGroup { group: string; items: NavItem[]; }

const NAV: NavGroup[] = [
  { group: 'Main', items: [{ href: '/admin', label: 'Dashboard', icon: UilHome, exact: true }] },
  { group: 'Catalog', items: [{ href: '/admin/products', label: 'Products', icon: UilPackage }, { href: '/admin/categories', label: 'Categories', icon: UilGrid }] },
  { group: 'People', items: [{ href: '/admin/sellers', label: 'Sellers', icon: UilStore, badge: 3 }, { href: '/admin/users', label: 'Buyers', icon: UilUser }] },
  { group: 'Commerce', items: [{ href: '/admin/orders', label: 'Orders', icon: UilMoneyBill }, { href: '/admin/promotions', label: 'Promotions', icon: UilFire }] },
  { group: 'System', items: [{ href: '/admin/settings', label: 'Settings', icon: UilCog }] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  const currentPage = NAV.flatMap(g => g.items).find(i => i.exact ? pathname === i.href : pathname.startsWith(i.href));

  return (
    <div className={styles.adminShell}>
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          <UilShield size="22" className={styles.logoIcon} />
          {!collapsed && <span className={styles.logoText}>E<span className={styles.logoAccent}>-guriro</span> Admin</span>}
        </div>

        <nav className={styles.sidebarNav}>
          {NAV.map(group => (
            <div key={group.group} className={styles.navGroup}>
              {!collapsed && <div className={styles.navGroupLabel}>{group.group}</div>}
              {group.items.map(item => {
                const IconComp = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                  >
                    <IconComp size="18" className={styles.navIcon} />
                    {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                    {!collapsed && item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.navItem} onClick={handleLogout} style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none' }} title={collapsed ? 'Logout' : undefined}>
            <UilSignOutAlt size="18" className={styles.navIcon} style={{ color: 'var(--color-error)' }} />
            {!collapsed && <span className={styles.navLabel} style={{ color: 'var(--color-error)' }}>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.collapseBtn} onClick={() => { setCollapsed(c => !c); setMobileOpen(m => !m); }}>
              <UilBars size="18" />
            </button>
            <div className={styles.breadcrumb}>
              <span>Admin</span>
              <UilArrowRight size="12" style={{ opacity: 0.4 }} />
              <strong>{currentPage?.label || 'Dashboard'}</strong>
            </div>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.adminBadge}><UilShield size="11" /> Admin</span>
            <span className={styles.adminName}>{user?.name || 'Administrator'}</span>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
