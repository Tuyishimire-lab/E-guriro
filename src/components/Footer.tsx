'use client';
import Link from 'next/link';
import {
  UilMobileAndroid, UilLaptop, UilHeadphones, UilTablet,
  UilShieldCheck, UilTruck, UilStore, UilPhone, UilEnvelope, UilMapMarker,
} from '@/components/Icons';
import styles from './Footer.module.css';

const SHOP_LINKS = [
  { label: 'Smartphones', href: '/products?category=smartphones', Icon: UilMobileAndroid },
  { label: 'Laptops & PCs', href: '/products?category=laptops', Icon: UilLaptop },
  { label: 'Tablets & iPads', href: '/products?category=tablets', Icon: UilTablet },
  { label: 'Audio & Headphones', href: '/products?category=audio', Icon: UilHeadphones },
  { label: 'Accessories', href: '/products?category=accessories', Icon: null },
  { label: 'Refurbished Deals', href: '/products?category=refurbished', Icon: null },
];

const SELL_LINKS = [
  { label: 'Become a Seller', href: '/auth/register?role=seller' },
  { label: 'Seller Dashboard', href: '/seller/dashboard' },
  { label: 'List a Product', href: '/seller/products' },
  { label: 'Seller Guidelines', href: '/help/seller-guide' },
];

const HELP_LINKS = [
  { label: 'Help Center', href: '/help' },
  { label: 'Warranty Claims', href: '/help/warranty' },
  { label: 'Returns Policy', href: '/help/returns' },
  { label: 'Delivery Info', href: '/help/delivery' },
  { label: 'Payment Methods', href: '/help/payments' },
];

const COMPANY_LINKS = [
  { label: 'About RwandaBuy', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>

      {/*  MAIN FOOTER BODY  */}
      <div className={`container ${styles.footerInner}`}>

        {/* Brand column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <UilMobileAndroid size="22" style={{ color: 'var(--brand-green)' }} />
            <span className={styles.logoText}>Rwanda<span className={styles.logoAccent}>Buy</span></span>
          </Link>

          <p className={styles.tagline}>
            Rwanda's #1 electronics store. Shop genuine smartphones, laptops,
            tablets and more from verified sellers across all 30 districts.
          </p>

          {/* Trust badges */}
          <div className={styles.trustBadges}>
            <span className={styles.trustBadge}>
              <UilShieldCheck size="13" />
              Official Warranty
            </span>
            <span className={styles.trustBadge}>
              <UilTruck size="13" />
              Nationwide Delivery
            </span>
            <span className={styles.trustBadge}>
              <UilStore size="13" />
              Verified Sellers
            </span>
          </div>

          {/* Payment methods */}
          <div className={styles.paymentBlock}>
            <p className={styles.paymentLabel}>Accepted Payments</p>
            <div className={styles.paymentBadges}>
              <span className={styles.payBadge}>MTN MoMo</span>
              <span className={styles.payBadge}>Airtel Money</span>
              <span className={styles.payBadge}>Visa / Card</span>
              <span className={styles.payBadge}>Bank Transfer</span>
            </div>
          </div>

          {/* Contact */}
          <div className={styles.contactBlock}>
            <a href="tel:+250788000000" className={styles.contactItem}>
              <UilPhone size="14" />
              +250 788 000 000
            </a>
            <a href="mailto:support@RwandaBuy.rw" className={styles.contactItem}>
              <UilEnvelope size="14" />
              support@RwandaBuy.rw
            </a>
            <span className={styles.contactItem}>
              <UilMapMarker size="14" />
              KG 11 Ave, Kigali, Rwanda
            </span>
          </div>
        </div>

        {/* Link columns */}
        <div className={styles.linksGrid}>
          {/* Shop */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Shop</h4>
            {SHOP_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className={styles.link}>{label}</Link>
            ))}
          </div>

          {/* Sell */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Sell</h4>
            {SELL_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className={styles.link}>{label}</Link>
            ))}
          </div>

          {/* Help */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Help</h4>
            {HELP_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className={styles.link}>{label}</Link>
            ))}
          </div>

          {/* Company */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Company</h4>
            {COMPANY_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} className={styles.link}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/*  FOOTER BOTTOM BAR  */}
      <div className={styles.footerBottom}>
        <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} RwandaBuy Ltd. All rights reserved. &nbsp;|&nbsp; Kigali, Rwanda
            </p>
            <p className={styles.bottomTagline}>
              Rwanda's #1 Electronics Marketplace
            </p>
            <div className={styles.socials}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className={styles.socialLink} aria-label="X / Twitter">X</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className={styles.socialLink} aria-label="Facebook">f</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className={styles.socialLink} aria-label="Instagram">in</a>
              <a href="https://wa.me/250788000000" target="_blank" rel="noopener noreferrer"
                className={styles.socialLink} aria-label="WhatsApp">W</a>
            </div>
        </div>
      </div>

    </footer>
  );
}
