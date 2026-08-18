'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatRWF, getShippingFee, RWANDA_DISTRICTS } from '@/lib/constants';
import {
  UilCheck, UilMobileAndroid, UilCreditCard, UilArrowRight,
  UilArrowLeft, UilMapMarker, UilUser, UilPhone, UilShoppingCart,
} from '@/components/Icons';
import styles from './page.module.css';

type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'card';
type CheckoutStep = 'details' | 'payment' | 'confirm' | 'success';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>('details');
  const [district, setDistrict] = useState(searchParams.get('district') || 'Gasabo');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [momoPhone, setMomoPhone] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderId] = useState(`EG-${Date.now().toString().slice(-6)}`);

  const shipping = getShippingFee(district);
  const total = totalPrice + shipping;

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 3000));
    setProcessing(false);
    clearCart();
    setStep('success');
  };

  if (items.length === 0 && step !== 'success') {
    router.push('/cart');
    return null;
  }

  const PAYMENT_OPTIONS = [
    {
      id: 'mtn_momo',
      icon: <UilMobileAndroid size="28" />,
      name: 'MTN Mobile Money',
      desc: 'You will receive a USSD push to confirm',
      badge: 'Most Popular',
    },
    {
      id: 'airtel_money',
      icon: <UilMobileAndroid size="28" />,
      name: 'Airtel Money',
      desc: 'Confirm via Airtel USSD prompt',
      badge: '',
    },
    {
      id: 'card',
      icon: <UilCreditCard size="28" />,
      name: 'Visa / Mastercard',
      desc: 'Secure online card payment',
      badge: '',
    },
  ];

  const STEPS = ['details', 'payment', 'confirm'];

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 900 }}>
      <h1 className={styles.pageTitle}>Checkout</h1>

      {/* Progress Steps */}
      <div className={styles.steps}>
        {STEPS.map((s, i) => {
          const done = STEPS.indexOf(step) > i || step === 'success';
          const active = step === s;
          return (
            <div key={s} className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}>
              <div className={styles.stepNum}>
                {done ? <UilCheck size="16" /> : i + 1}
              </div>
              <span className={styles.stepLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          );
        })}
      </div>

      {/* Success */}
      {step === 'success' && (
        <div className={styles.success}>
          <div className={styles.successIconWrap}>
            <UilCheck size="56" className={styles.successCheckIcon} />
          </div>
          <h2 className={styles.successTitle}>Order Placed Successfully!</h2>
          <p className={styles.successSub}>Order ID: <strong>{orderId}</strong></p>
          <p className={styles.successDesc}>
            Your order has been confirmed. You will receive an SMS to <strong>{phone}</strong> with tracking updates.
            Estimated delivery: 2-5 business days to {district}.
          </p>
          <div className={styles.successActions}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/buyer/orders')} id="view-orders-btn">
              Track My Order
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/products')} id="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {step !== 'success' && (
        <div className={styles.layout}>
          {/* Left Panel */}
          <div className={styles.mainPanel}>
            {/* Step 1: Details */}
            {step === 'details' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <UilMapMarker size="22" style={{ color: 'var(--brand-green)' }} />
                  Delivery Details
                </h2>
                <div className={styles.formGrid}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="full-name">Full Name</label>
                    <input id="full-name" className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="phone-num">Phone Number</label>
                    <input id="phone-num" className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0788 000 000" />
                  </div>
                  <div className="input-group" style={{ gridColumn: '1/-1' }}>
                    <label className="input-label" htmlFor="district-sel">District</label>
                    <select id="district-sel" className="select" value={district} onChange={e => setDistrict(e.target.value)}>
                      {Object.entries(RWANDA_DISTRICTS).map(([province, districts]) => (
                        <optgroup key={province} label={province}>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="input-group" style={{ gridColumn: '1/-1' }}>
                    <label className="input-label" htmlFor="address">Street / Sector / Village</label>
                    <input id="address" className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. KN 5 Ave, Remera Sector" />
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => setStep('payment')} id="to-payment-btn" disabled={!fullName || !phone}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Continue to Payment <UilArrowRight size="18" />
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 'payment' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <UilCreditCard size="22" style={{ color: 'var(--brand-green)' }} />
                  Choose Payment Method
                </h2>
                <div className={styles.paymentOptions}>
                  {PAYMENT_OPTIONS.map(opt => (
                    <div
                      key={opt.id}
                      className={`${styles.payOption} ${paymentMethod === opt.id ? styles.payOptionActive : ''}`}
                      onClick={() => setPaymentMethod(opt.id as PaymentMethod)}
                      id={`pay-${opt.id}`}
                    >
                      <span className={styles.payIcon}>{opt.icon}</span>
                      <div className={styles.payInfo}>
                        <span className={styles.payName}>{opt.name}</span>
                        <span className={styles.payDesc}>{opt.desc}</span>
                      </div>
                      {opt.badge && <span className="badge badge-green">{opt.badge}</span>}
                      <div className={`${styles.payRadio} ${paymentMethod === opt.id ? styles.payRadioActive : ''}`} />
                    </div>
                  ))}
                </div>

                {(paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money') && (
                  <div className={styles.momoForm}>
                    <div className={styles.momoHeader}>
                      <UilMobileAndroid size="28" style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
                      <div>
                        <strong>{paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Airtel Money'}</strong>
                        <p>Enter your phone number. You will get a push notification to confirm.</p>
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="momo-phone">
                        {paymentMethod === 'mtn_momo' ? 'MTN' : 'Airtel'} Phone Number
                      </label>
                      <input id="momo-phone" className="input" value={momoPhone} onChange={e => setMomoPhone(e.target.value)}
                        placeholder={paymentMethod === 'mtn_momo' ? '078X XXX XXX' : '073X XXX XXX'} />
                    </div>
                    <p className={styles.momoNote}>
                      Dial {paymentMethod === 'mtn_momo' ? '*182#' : '*185#'} to check your balance first
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className={styles.momoForm}>
                    <div className="input-group">
                      <label className="input-label" htmlFor="card-num">Card Number</label>
                      <input id="card-num" className="input" value={cardNum} onChange={e => setCardNum(e.target.value)}
                        placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className={styles.formGrid}>
                      <div className="input-group">
                        <label className="input-label" htmlFor="card-expiry">Expiry</label>
                        <input id="card-expiry" className="input" placeholder="MM/YY" />
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="card-cvv">CVV</label>
                        <input id="card-cvv" className="input" placeholder="123" maxLength={3} />
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.btnRow}>
                  <button className="btn btn-ghost" onClick={() => setStep('details')} id="back-to-details-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UilArrowLeft size="18" /> Back
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep('confirm')} id="to-confirm-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Review Order <UilArrowRight size="18" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <UilCheck size="22" style={{ color: 'var(--brand-green)' }} />
                  Review and Confirm
                </h2>
                <div className={styles.confirmDetails}>
                  <div className={styles.confirmRow}><span>Name</span><strong>{fullName}</strong></div>
                  <div className={styles.confirmRow}><span>Phone</span><strong>{phone}</strong></div>
                  <div className={styles.confirmRow}><span>District</span><strong>{district}</strong></div>
                  <div className={styles.confirmRow}>
                    <span>Payment</span>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {paymentMethod === 'card'
                        ? <><UilCreditCard size="16" /> Visa / Mastercard</>
                        : <><UilMobileAndroid size="16" /> {paymentMethod === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'}</>}
                    </strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>Total</span>
                    <strong style={{ color: 'var(--brand-green)', fontSize: '1.1rem' }}>{formatRWF(total)}</strong>
                  </div>
                </div>

                {processing && (
                  <div className={styles.processing}>
                    <div className={styles.spinner} />
                    <p>Processing your payment...</p>
                    {paymentMethod !== 'card' && (
                      <p className={styles.processingNote}>Check your phone for the USSD prompt and confirm the payment</p>
                    )}
                  </div>
                )}

                <div className={styles.btnRow}>
                  <button className="btn btn-ghost" onClick={() => setStep('payment')} disabled={processing} id="back-to-payment-btn"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UilArrowLeft size="18" /> Back
                  </button>
                  <button
                    className="btn btn-gold btn-lg"
                    onClick={handlePayment}
                    disabled={processing}
                    id="place-order-btn"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {processing ? 'Processing...' : `Place Order - ${formatRWF(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Panel */}
          <div className={styles.summaryPanel}>
            <h3 className={styles.summaryTitle}>
              <UilShoppingCart size="18" />
              Order Summary
            </h3>
            <div className={styles.summaryItems}>
              {items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <img src={item.image} alt={item.title} className={styles.summaryImg} />
                  <div className={styles.summaryItemInfo}>
                    <p className={styles.summaryItemTitle}>{item.title}</p>
                    <p className={styles.summaryItemQty}>x{item.quantity}</p>
                  </div>
                  <span className={styles.summaryItemPrice}>{formatRWF(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}><span>Subtotal</span><span>{formatRWF(totalPrice)}</span></div>
              <div className={styles.summaryLine}><span>Shipping ({district})</span><span>{formatRWF(shipping)}</span></div>
              <div className={`${styles.summaryLine} ${styles.summaryTotal}`}><span>Total</span><span>{formatRWF(total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
