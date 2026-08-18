'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PRODUCT_CATEGORIES, formatRWF } from '@/lib/constants';
import { UilImages, UilPlus, UilTimes, UilCheck, UilArrowLeft, UilCamera } from '@/components/Icons';
import styles from '../../../admin/products/products.module.css';
import adminStyles from '../../../admin/layout.module.css';

const CONDITIONS = ['New', 'Like New', 'Refurbished'] as const;
const WARRANTIES = ['None', '3 Months', '6 Months', '1 Year', '2 Years'] as const;

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', price: '', category: 'smartphones',
    description: '', condition: 'New', warranty: 'None', stock: '10',
    ram: '', storage: '', battery: '', screen: '', processor: '', camera: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 5 - images.length).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setImages(prev => prev.length < 5 ? [...prev, result] : prev);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Product title is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setToast('Product submitted for review — it will go live after admin approval.');
    setTimeout(() => router.push('/seller/dashboard'), 2500);
  };

  const specCategories = ['smartphones', 'tablets', 'laptops', 'audio', 'cameras'];
  const showSpecs = specCategories.includes(form.category);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <UilArrowLeft size="16" /> Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>List a New Product</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2px 0 0' }}>
            Selling as: <strong style={{ color: 'var(--brand-green)' }}>{user?.shopName || user?.name}</strong>
          </p>
        </div>
      </div>

      <div className={styles.formLayout}>
        {/* LEFT — Image upload */}
        <div className={styles.imageSection}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>
            Product Images <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(up to 5)</span>
          </label>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''} ${images.length >= 5 ? styles.dropZoneFull : ''}`}
            onClick={() => images.length < 5 && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {images.length === 0 ? (
              <div className={styles.dropZoneEmpty}>
                <div className={styles.dropIcon}>
                  <UilImages size="32" style={{ color: 'var(--brand-green)' }} />
                </div>
                <p className={styles.dropTitle}>Drag & drop images here</p>
                <p className={styles.dropSub}>or click to browse — JPG, PNG, WEBP</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, pointerEvents: 'none' }}>
                  <UilCamera size="14" /> Browse Files
                </button>
              </div>
            ) : (
              <div className={styles.previewGrid}>
                {images.map((src, idx) => (
                  <div key={idx} className={`${styles.previewItem} ${idx === 0 ? styles.previewCover : ''}`}>
                    <img src={src} alt="" className={styles.previewImg} />
                    {idx === 0 && <span className={styles.coverBadge}>Cover</span>}
                    <button className={styles.removeBtn} onClick={e => { e.stopPropagation(); removeImage(idx); }}>
                      <UilTimes size="12" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div className={styles.addMore}>
                    <UilPlus size="20" style={{ color: 'var(--text-muted)' }} />
                    <span>Add more</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>First image is the cover photo shown in listings.</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => processFiles(e.target.files)} />
        </div>

        {/* RIGHT — Fields */}
        <div className={styles.fieldsSection}>
          {/* Title */}
          <div className={adminStyles.formGroup}>
            <label className={adminStyles.formLabel}>Product Title *</label>
            <input className={adminStyles.formInput} placeholder="e.g. Samsung Galaxy S25 Ultra 256GB" value={form.title} onChange={set('title')} />
            {errors.title && <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: 3 }}>{errors.title}</p>}
          </div>

          {/* Price + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className={adminStyles.formGroup}>
              <label className={adminStyles.formLabel}>Price (RWF) *</label>
              <input className={adminStyles.formInput} type="number" placeholder="850000" value={form.price} onChange={set('price')} />
              {errors.price && <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: 3 }}>{errors.price}</p>}
            </div>
            <div className={adminStyles.formGroup}>
              <label className={adminStyles.formLabel}>Category</label>
              <select className={adminStyles.formSelect} value={form.category} onChange={set('category')}>
                {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Condition + Warranty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className={adminStyles.formGroup}>
              <label className={adminStyles.formLabel}>Condition</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {CONDITIONS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, condition: c }))}
                    className={`btn btn-xs ${form.condition === c ? 'btn-primary' : 'btn-ghost'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className={adminStyles.formGroup}>
              <label className={adminStyles.formLabel}>Warranty</label>
              <select className={adminStyles.formSelect} value={form.warranty} onChange={set('warranty')}>
                {WARRANTIES.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className={adminStyles.formGroup}>
            <label className={adminStyles.formLabel}>Stock Quantity</label>
            <input className={adminStyles.formInput} type="number" min="1" value={form.stock} onChange={set('stock')} />
          </div>

          {/* Description */}
          <div className={adminStyles.formGroup}>
            <label className={adminStyles.formLabel}>Description *</label>
            <textarea className={adminStyles.formInput} rows={3} placeholder="Describe the product — features, what's in the box..." value={form.description} onChange={set('description')} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            {errors.description && <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: 3 }}>{errors.description}</p>}
          </div>

          {/* Specs (shown for relevant categories) */}
          {showSpecs && (
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Technical Specs</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'ram', label: 'RAM', placeholder: 'e.g. 8GB' },
                  { key: 'storage', label: 'Storage', placeholder: 'e.g. 256GB' },
                  { key: 'battery', label: 'Battery', placeholder: 'e.g. 5000mAh' },
                  { key: 'screen', label: 'Screen', placeholder: 'e.g. 6.7" AMOLED' },
                  { key: 'processor', label: 'Processor', placeholder: 'e.g. Snapdragon 8 Gen 3' },
                  { key: 'camera', label: 'Camera', placeholder: 'e.g. 200MP' },
                ].map(f => (
                  <div key={f.key} className={adminStyles.formGroup}>
                    <label className={adminStyles.formLabel}>{f.label}</label>
                    <input className={adminStyles.formInput} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={set(f.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price preview */}
          {form.price && (
            <div style={{ padding: '10px 14px', background: 'rgba(0,165,80,0.06)', border: '1px solid rgba(0,165,80,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              Listing price: <strong style={{ color: 'var(--brand-green)' }}>{formatRWF(Number(form.price))}</strong>
              {' '}&middot; Platform commission (8%): <strong>{formatRWF(Math.round(Number(form.price) * 0.08))}</strong>
              {' '}&middot; You receive: <strong style={{ color: 'var(--brand-green)' }}>{formatRWF(Math.round(Number(form.price) * 0.92))}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button className="btn btn-primary" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UilCheck size="16" /> Submit for Review
            </button>
            <button className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-card)', border: '1px solid var(--brand-green)', borderRadius: 'var(--radius-md)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 999, boxShadow: 'var(--shadow-card)', fontSize: '0.88rem', color: 'var(--text-primary)', maxWidth: 380 }}>
          <UilCheck size="18" style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
          {toast}
        </div>
      )}
    </div>
  );
}
