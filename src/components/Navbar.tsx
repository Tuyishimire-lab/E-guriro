'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  UilShoppingCart, UilSearch, UilUser, UilBars, UilTimes,
  UilAngleDown, UilSignOutAlt, UilStore, UilHeart,
  UilComment, UilShield, UilGrid,
} from '@/components/Icons';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'seller') return '/seller/dashboard';
    return '/buyer/orders';
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navInner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <UilShoppingCart size="22" className={styles.logoIconSvg} />
          <span className={styles.logoText}>
            E<span className={styles.logoAccent}>-guriro</span>
          </span>
        </Link>

        {/* Search */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrapper}>
            <UilSearch size="18" className={styles.searchIconSvg} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products, sellers, categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="nav-search"
            />
            <button type="submit" className={styles.searchBtn} id="search-submit-btn">
              Search
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className={styles.navActions}>
          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn} id="cart-nav-btn" aria-label="Cart">
            <UilShoppingCart size="22" />
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </Link>

          {/* Chat */}
          <Link href="/chat" className={styles.iconBtn} id="chat-nav-btn" aria-label="Messages">
            <UilComment size="22" />
          </Link>

          {/* User Menu */}
          {user ? (
            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="user-menu-btn"
              >
                <span className={styles.userAvatar}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                <UilAngleDown size="16" className={`${styles.chevronIcon} ${userMenuOpen ? styles.chevronUp : ''}`} />
              </button>

              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{user.name}</p>
                    <p className={styles.dropdownEmail}>{user.email}</p>
                    <span className={`badge ${user.role === 'seller' ? 'badge-green' : user.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>
                      {user.role}
                    </span>
                  </div>
                  <hr className="divider" style={{ margin: '8px 0' }} />
                  <Link href={getDashboardLink()} className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    {user.role === 'admin' ? <UilShield size="16" /> : user.role === 'seller' ? <UilStore size="16" /> : <UilGrid size="16" />}
                    My Dashboard
                  </Link>
                  {user.role === 'buyer' && (
                    <Link href="/buyer/wishlist" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <UilHeart size="16" />
                      Wishlist
                    </Link>
                  )}
                  {user.role === 'seller' && (
                    <Link href="/seller/products" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <UilStore size="16" />
                      My Products
                    </Link>
                  )}
                  <Link href="/chat" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    <UilComment size="16" />
                    Messages
                  </Link>
                  <hr className="divider" style={{ margin: '8px 0' }} />
                  <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={() => { logout(); setUserMenuOpen(false); }} id="logout-btn">
                    <UilSignOutAlt size="16" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/auth/login" className="btn btn-ghost btn-sm" id="nav-login-btn">Login</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm" id="nav-register-btn">Sign Up</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <UilTimes size="24" /> : <UilBars size="24" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="text"
              className="input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">Go</button>
          </form>
          <div className={styles.mobileLinks}>
            <Link href="/products" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>All Products</Link>
            <Link href="/cart" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Cart ({totalItems})</Link>
            {user ? (
              <>
                <Link href={getDashboardLink()} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button className={`${styles.mobileLink} ${styles.logoutMobileBtn}`} onClick={() => { logout(); setMobileOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/auth/register" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
