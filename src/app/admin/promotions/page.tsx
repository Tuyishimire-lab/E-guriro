'use client';
import { useState } from 'react';
import { formatRWF, MOCK_PRODUCTS } from '@/lib/constants';
import { UilFire, UilTag, UilBell, UilPlus, UilTrashAlt, UilCheck, UilTimes, UilEdit } from '@/components/Icons';
import styles from '../layout.module.css';

type Tab = 'flash' | 'codes' | 'banners';

interface FlashSale { id: string; name: string; discount: number; products: string[]; endsAt: string; active: boolean; }
interface DiscountCode { id: string; code: string; type: 'percent' | 'fixed'; value: number; maxUses: number; usedCount: number; expiry: string; active: boolean; }
interface Banner { id: string; text: string; cta: string; ctaLink: string; color: string; active: boolean; }

const INITIAL_FLASH: FlashSale[] = [
  { id: 'f1', name: 'Weekend Tech Sale', discount: 15, products: ['1', '2', '7'], endsAt: '2026-08-18T23:59', active: true },
  { id: 'f2', name: 'Samsung Super Deal', discount: 20, products: ['1', '4'], endsAt: '2026-08-20T12:00', active: false },
];
const INITIAL_CODES: DiscountCode[] = [
  { id: 'c1', code: 'RWANDABUY10', type: 'percent', value: 10, maxUses: 500, usedCount: 123, expiry: '2026-09-30', active: true },
  { id: 'c2', code: 'WELCOME5K', type: 'fixed', value: 5000, maxUses: 1000, usedCount: 0, expiry: '2026-12-31', active: true },
  { id: 'c3', code: 'FLASH25', type: 'percent', value: 25, maxUses: 100, usedCount: 100, expiry: '2026-08-15', active: false },
];
const INITIAL_BANNERS: Banner[] = [
  { id: 'b1', text: 'Free delivery on orders above RWF 100,000 - All 30 districts!', cta: 'Shop Now', ctaLink: '/products', color: '#00A550', active: true },
  { id: 'b2', text: 'New: Pay with MTN MoMo or Airtel Money at checkout', cta: 'Learn More', ctaLink: '/', color: '#3B82F6', active: false },
];

export default function AdminPromotions() {
  const [tab, setTab] = useState<Tab>('flash');
  const [flashSales, setFlashSales] = useState<FlashSale[]>(INITIAL_FLASH);
  const [codes, setCodes] = useState<DiscountCode[]>(INITIAL_CODES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Flash sale form state
  const [fsName, setFsName] = useState('');
  const [fsDiscount, setFsDiscount] = useState('');
  const [fsProducts, setFsProducts] = useState<string[]>([]);
  const [fsEndsAt, setFsEndsAt] = useState('');

  // Code form state
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percent' | 'fixed'>('percent');
  const [cValue, setCValue] = useState('');
  const [cMaxUses, setCMaxUses] = useState('');
  const [cExpiry, setCExpiry] = useState('');

  // Banner form state
  const [bText, setBText] = useState('');
  const [bCta, setBCta] = useState('');
  const [bLink, setBLink] = useState('/products');
  const [bColor, setBColor] = useState('#00A550');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggleFlash = (id: string) => { setFlashSales(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f)); showToast('Flash sale updated'); };
  const deleteFlash = (id: string) => { setFlashSales(prev => prev.filter(f => f.id !== id)); showToast('Flash sale deleted'); };

  const toggleCode = (id: string) => { setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c)); showToast('Code updated'); };
  const deleteCode = (id: string) => { setCodes(prev => prev.filter(c => c.id !== id)); showToast('Code deleted'); };

  const toggleBanner = (id: string) => { setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b)); showToast('Banner updated'); };
  const deleteBanner = (id: string) => { setBanners(prev => prev.filter(b => b.id !== id)); showToast('Banner deleted'); };

  const addFlash = () => {
    if (!fsName || !fsDiscount) return;
    setFlashSales(prev => [...prev, { id: Date.now().toString(), name: fsName, discount: Number(fsDiscount), products: fsProducts, endsAt: fsEndsAt, active: false }]);
    setFsName(''); setFsDiscount(''); setFsProducts([]); setFsEndsAt('');
    setShowForm(false); showToast('Flash sale created');
  };

  const addCode = () => {
    if (!cCode || !cValue) return;
    setCodes(prev => [...prev, { id: Date.now().toString(), code: cCode.toUpperCase(), type: cType, value: Number(cValue), maxUses: Number(cMaxUses) || 100, usedCount: 0, expiry: cExpiry, active: true }]);
    setCCode(''); setCValue(''); setCMaxUses(''); setCExpiry('');
    setShowForm(false); showToast('Discount code created');
  };

  const addBanner = () => {
    if (!bText) return;
    setBanners(prev => [...prev, { id: Date.now().toString(), text: bText, cta: bCta, ctaLink: bLink, color: bColor, active: false }]);
    setBText(''); setBCta(''); setBLink('/products'); setBColor('#00A550');
    setShowForm(false); showToast('Banner created');
  };

  const TABS = [
    { id: 'flash' as Tab, label: 'Flash Sales', icon: UilFire, count: flashSales.length },
    { id: 'codes' as Tab, label: 'Discount Codes', icon: UilTag, count: codes.length },
    { id: 'banners' as Tab, label: 'Banners', icon: UilBell, count: banners.length },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Promotions</h1>
          <p className={styles.pageSub}>Manage flash sales, discount codes, and site banners</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showForm ? <UilTimes size="15" /> : <UilPlus size="15" />}
          {showForm ? 'Cancel' : 'Create New'}
        </button>
      </div>

      {/* Tab switcher */}
      <div className={styles.statusTabs} style={{ marginBottom: 20 }}>
        {TABS.map(t => {
          const IconComp = t.icon;
          return (
            <button key={t.id} className={`${styles.statusTab} ${tab === t.id ? styles.statusTabActive : ''}`} onClick={() => { setTab(t.id); setShowForm(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconComp size="15" /> {t.label} ({t.count})
            </button>
          );
        })}
      </div>

      {/* Flash Sales */}
      {tab === 'flash' && (
        <>
          {showForm && (
            <div className={styles.formCard}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>New Flash Sale</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sale Name *</label>
                  <input className={styles.formInput} placeholder="e.g. Weekend Tech Sale" value={fsName} onChange={e => setFsName(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discount % *</label>
                  <input className={styles.formInput} type="number" min="1" max="80" placeholder="e.g. 20" value={fsDiscount} onChange={e => setFsDiscount(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ends At</label>
                  <input className={styles.formInput} type="datetime-local" value={fsEndsAt} onChange={e => setFsEndsAt(e.target.value)} />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginBottom: 16 }}>
                <label className={styles.formLabel}>Include Products (select multiple)</label>
                <select multiple className={styles.formSelect} style={{ height: 120 }} value={fsProducts} onChange={e => setFsProducts(Array.from(e.target.selectedOptions, o => o.value))}>
                  {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className={styles.formActions}>
                <button className="btn btn-primary" onClick={addFlash}>Create Flash Sale</button>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {flashSales.map(f => (
              <div key={f.id} className={styles.promoCard}>
                <div className={styles.promoCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UilFire size="18" style={{ color: '#EF4444' }} />
                    </div>
                    <div>
                      <div className={styles.promoCardTitle}>{f.name}</div>
                      <div className={styles.promoCardMeta}>{f.discount}% off &bull; {f.products.length} products &bull; Ends {f.endsAt || 'No end date'}</div>
                    </div>
                  </div>
                  <span className={`badge ${f.active ? 'badge-green' : 'badge-red'}`}>{f.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className={styles.promoCardActions}>
                  <button className={`btn btn-sm ${f.active ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleFlash(f.id)}>{f.active ? 'Deactivate' : 'Activate'}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteFlash(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><UilTrashAlt size="13" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Discount Codes */}
      {tab === 'codes' && (
        <>
          {showForm && (
            <div className={styles.formCard}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>New Discount Code</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Code *</label>
                  <input className={styles.formInput} placeholder="e.g. SUMMER20" value={cCode} onChange={e => setCCode(e.target.value.toUpperCase())} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type</label>
                  <select className={styles.formSelect} value={cType} onChange={e => setCType(e.target.value as 'percent' | 'fixed')}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (RWF)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Value *</label>
                  <input className={styles.formInput} type="number" placeholder={cType === 'percent' ? '10 (means 10%)' : '5000 (RWF)'} value={cValue} onChange={e => setCValue(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Max Uses</label>
                  <input className={styles.formInput} type="number" placeholder="500" value={cMaxUses} onChange={e => setCMaxUses(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date</label>
                  <input className={styles.formInput} type="date" value={cExpiry} onChange={e => setCExpiry(e.target.value)} />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className="btn btn-primary" onClick={addCode}>Create Code</button>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Uses</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ background: 'rgba(0,165,80,0.1)', color: 'var(--brand-green)', padding: '2px 8px', borderRadius: 4, fontSize: '0.85rem', fontWeight: 700 }}>{c.code}</code></td>
                    <td><span className="badge badge-blue">{c.type}</span></td>
                    <td className={styles.tdAmount}>{c.type === 'percent' ? `${c.value}%` : formatRWF(c.value)}</td>
                    <td style={{ fontSize: '0.82rem' }}>{c.usedCount}/{c.maxUses}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.expiry || 'No expiry'}</td>
                    <td><span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Active' : 'Expired'}</span></td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={`btn btn-sm ${c.active ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleCode(c.id)}>{c.active ? 'Disable' : 'Enable'}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCode(c.id)}><UilTrashAlt size="13" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Banners */}
      {tab === 'banners' && (
        <>
          {showForm && (
            <div className={styles.formCard}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>New Announcement Banner</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>Banner Text *</label>
                  <input className={styles.formInput} placeholder="e.g. Free delivery on all orders this weekend!" value={bText} onChange={e => setBText(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Button Text</label>
                  <input className={styles.formInput} placeholder="e.g. Shop Now" value={bCta} onChange={e => setBCta(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CTA Link</label>
                  <input className={styles.formInput} placeholder="/products" value={bLink} onChange={e => setBLink(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Banner Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="color" value={bColor} onChange={e => setBColor(e.target.value)} style={{ width: 44, height: 38, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
                    <input className={styles.formInput} value={bColor} onChange={e => setBColor(e.target.value)} />
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div style={{ padding: '12px 20px', borderRadius: 'var(--radius-md)', background: bColor, color: '#fff', fontSize: '0.875rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{bText || 'Preview text here...'}</span>
                {bCta && <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer' }}>{bCta}</button>}
              </div>
              <div className={styles.formActions}>
                <button className="btn btn-primary" onClick={addBanner}>Create Banner</button>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {banners.map(b => (
              <div key={b.id} className={styles.promoCard}>
                <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: b.color, color: '#fff', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{b.text}</span>
                  {b.cta && <span style={{ opacity: 0.8, fontSize: '0.78rem', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20 }}>{b.cta}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${b.active ? 'badge-green' : 'badge-red'}`}>{b.active ? 'Live on site' : 'Hidden'}</span>
                  <div className={styles.actionBtns}>
                    <button className={`btn btn-sm ${b.active ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleBanner(b.id)}>{b.active ? 'Hide' : 'Publish'}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteBanner(b.id)}><UilTrashAlt size="13" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}
