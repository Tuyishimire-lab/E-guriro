'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatRWF, getShippingFee, RWANDA_DISTRICTS } from '@/lib/constants';
import { useState } from 'react';
import {
  UilShoppingCart, UilTrashAlt, UilPlus, UilMinus,
  UilTruck, UilMapMarker, UilArrowRight, UilMobileAndroid, UilCreditCard,
} from '@/components/Icons';
import styles from './page.module.css';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const [district, setDistrict] = useState('Gasabo');
  const shipping = getShippingFee(district);
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyPage}`}>
        <UilShoppingCart size="80" className={styles.emptyIcon} />
        <h1>Your cart is empty</h1>
        <p>Add some amazing products from our marketplace!</p>
        <Link href="/products" className="btn btn-primary btn-lg" id="empty-cart-shop-btn">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <h1 className={styles.pageTitle}>
        <UilShoppingCart size="28" />
        Shopping Cart <span className={styles.itemCount}>({items.length} item{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className={styles.layout}>
        {/* Cart Items */}
        <div className={styles.itemsList}>
          {items.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <img src={item.image} alt={item.title} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <Link href={`/products/${item.id}`} className={styles.itemTitle}>{item.title}</Link>
                <p className={styles.itemSeller}>{item.seller}</p>
                <p className={styles.itemPrice}>{formatRWF(item.price)}</p>
              </div>
              <div className={styles.itemControls}>
                <div className={styles.qtyRow}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} id={`dec-${item.id}`}>
                    <UilMinus size="16" />
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} id={`inc-${item.id}`}>
                    <UilPlus size="16" />
                  </button>
                </div>
                <p className={styles.lineTotal}>{formatRWF(item.price * item.quantity)}</p>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)} id={`remove-${item.id}`} aria-label="Remove item">
                  <UilTrashAlt size="16" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label">
              <UilMapMarker size="15" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Delivery District
            </label>
            <select className="select" value={district} onChange={e => setDistrict(e.target.value)} id="cart-district-select">
              {Object.entries(RWANDA_DISTRICTS).map(([province, districts]) => (
                <optgroup key={province} label={province}>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className={styles.summaryLines}>
            <div className={styles.summaryLine}>
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>{formatRWF(totalPrice)}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>
                <UilTruck size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Delivery to {district}
              </span>
              <span className={shipping === 0 ? styles.free : ''}>{shipping === 0 ? 'FREE' : formatRWF(shipping)}</span>
            </div>
            <hr className="divider" />
            <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span className={styles.totalAmount}>{formatRWF(total)}</span>
            </div>
          </div>

          <Link
            href={`/checkout?district=${district}`}
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            id="proceed-checkout-btn"
          >
            Proceed to Checkout
            <UilArrowRight size="18" />
          </Link>

          <div className={styles.paymentIcons}>
            <UilMobileAndroid size="16" />
            <span>MTN MoMo</span>
            <UilMobileAndroid size="16" />
            <span>Airtel Money</span>
            <UilCreditCard size="16" />
            <span>Card</span>
          </div>
        </div>
      </div>
    </div>
  );
}
