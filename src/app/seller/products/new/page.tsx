'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PRODUCT_CATEGORIES, formatRWF } from '@/lib/constants';
import { UilImages, UilPlus, UilTimes, UilCheck, UilArrowLeft, UilCamera, UilUpload } from '@/components/Icons';
import { uploadImages } from '@/lib/upload';
import { createProduct } from '@/lib/services/products';
import styles from '../../../admin/products/products.module.css';
import adminStyles from '../../../admin/layout.module.css';

const CONDITIONS = ['New', 'Like New', 'Refurbished'] as const;
const WARRANTIES = ['None', '3 Months', '6 Months', '1 Year', '2 Years'] as const;

// Upload state per image slot
interface ImageSlot {
  preview: string;    // local blob URL for preview
  file: File;         // original File for upload
  uploaded?: string;  // Vercel Blob CDN URL after upload
  uploading: boolean;
  error?: string;
}

export default function NewProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '', price: '', category: 'smartphones',
    description: '', condition: 'New', warranty: 'None', stock: '10',
    ram: '', storage: '', battery: '', screen: '', processor: '', camera: '',
  });
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  // Process picked files — create preview + start upload immediately
  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 5 - slots.length);
    if (!incoming.length) return;

    // Add slots with uploading state
    const newSlots: ImageSlot[] = incoming.map(file => ({
      preview:   URL.createObjectURL(file),
      file,
      uploading: true,
    }));
    setSlots(prev => [...prev, ...newSlots]);

    // Upload each to Vercel Blob via /api/upload
    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];
      try {
        const [url] = await uploadImages([file]);
        setSlots(prev => prev.map(s =>
          s.file === file ? { ...s, uploaded: url, uploading: false } : s
        ));
      } catch {
        setSlots(prev => prev.map(s =>
          s.file === file ? { ...s, error: 'Upload failed', uploading: false } : s
        ));
      }
    }
  }, [slots.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeSlot = (idx: number) => {
    setSlots(prev => {
      const next = prev.filter((_, i) => i !== idx);
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(prev[idx].preview);
      return next;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())   e.title       = 'Product title is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (slots.length === 0)   e.images      = 'At least one product image is required';
    if (slots.some(s => s.uploading)) e.images = 'Please wait for images to finish uploading';
    if (slots.some(s => s.error))     e.images = 'Some images failed to upload — remove and try again';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const imageUrls = slots.map(s => s.uploaded!);
      await createProduct({
        title:       form.title,
        price:       Number(form.price),
        image:       imageUrls[0],
        images:      imageUrls,
        seller:      user?.shopName ?? user?.name ?? '',
        sellerId:    user?.uid ?? '',
        category:    form.category,
        description: form.description,
        condition:   form.condition.toLowerCase() as 'new' | 'refurbished',
        warranty:    form.warranty,
        stock:       Number(form.stock),
        rating:      0,
        specs: {
          ram:       form.ram || undefined,
          storage:   form.storage || undefined,
          battery:   form.battery || undefined,
          screen:    form.screen || undefined,
          processor: form.processor || undefined,
          camera:    form.camera || undefined,
        },
      }, imageUrls);

      setToast('Product submitted for review — it will go live after admin approval.');
      setTimeout(() => router.push('/seller/dashboard'), 2500);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const specCategories = ['smartphones', 'tablets', 'laptops', 'audio', 'cameras'];
  const showSpecs = specCategories.includes(form.category);
  const allUploaded = slots.length > 0 && slots.every(s => s.uploaded && !s.uploading);

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
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''} ${slots.length >= 5 ? styles.dropZoneFull : ''}`}
            onClick={() => slots.length < 5 && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {slots.length === 0 ? (
              <div className={styles.dropZoneEmpty}>
                <div className={styles.dropIcon}>
                  <UilImages size="32" style={{ color: 'var(--brand-green)' }} />
                </div>
                <p className={styles.dropTitle}>Drag &amp; drop images here</p>
                <p className={styles.dropSub}>or click to browse — JPG, PNG, WEBP · max 10MB each</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, pointerEvents: 'none' }}>
                  <UilCamera size="14" /> Browse Files
                </button>
              </div>
            ) : (
              <div className={styles.previewGrid}>
                {slots.map((slot, idx) => (
                  <div key={idx} className={`${styles.previewItem} ${idx === 0 ? styles.previewCover : ''}`}>
                    <img src={slot.preview} alt="" className={styles.previewImg} />

                    {/* Cover badge */}
                    {idx === 0 && !slot.uploading && !slot.error && (
                      <span className={styles.coverBadge}>Cover</span>
                    )}

                    {/* Uploading overlay */}
                    {slot.uploading && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'inherit', gap: 4,
                      }}>
                        <UilUpload size="20" style={{ color: '#fff', animation: 'pulse 1s infinite' }} />
                        <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>Uploading...</span>
                      </div>
                    )}

                    {/* Uploaded tick */}
                    {slot.uploaded && !slot.uploading && (
                      <div style={{
                        position: 'absolute', top: 4, left: 4, width: 20, height: 20,
                        background: 'var(--brand-green)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <UilCheck size="12" style={{ color: '#fff' }} />
                      </div>
                    )}

                    {/* Error badge */}
                    {slot.error && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'inherit', fontSize: '0.65rem', color: '#fff', fontWeight: 700, textAlign: 'center', padding: 4
                      }}>
                        Failed
                      </div>
                    )}

                    <button className={styles.removeBtn} onClick={e => { e.stopPropagation(); removeSlot(idx); }}>
                      <UilTimes size="12" />
                    </button>
                  </div>
                ))}
                {slots.length < 5 && (
                  <div className={styles.addMore}>
                    <UilPlus size="20" style={{ color: 'var(--text-muted)' }} />
                    <span>Add more</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload status summary */}
          {slots.length > 0 && (
            <p style={{ fontSize: '0.72rem', marginTop: 6, color: allUploaded ? 'var(--brand-green)' : 'var(--text-muted)' }}>
              {slots.filter(s => s.uploading).length > 0
                ? `Uploading ${slots.filter(s => s.uploading).length} image(s) to Vercel Blob...`
                : allUploaded
                  ? `${slots.length} image(s) uploaded successfully.`
                  : 'First image is the cover photo shown in listings.'}
            </p>
          )}
          {errors.images && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: 4 }}>{errors.images}</p>}

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

          {/* Tech Specs */}
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
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
              {' '}&middot; Commission (8%): <strong>{formatRWF(Math.round(Number(form.price) * 0.08))}</strong>
              {' '}&middot; You receive: <strong style={{ color: 'var(--brand-green)' }}>{formatRWF(Math.round(Number(form.price) * 0.92))}</strong>
            </div>
          )}

          {errors.submit && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.82rem', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)' }}>
              {errors.submit}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || slots.some(s => s.uploading)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              id="submit-product-btn"
            >
              {submitting
                ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />  Submitting...</>
                : <><UilCheck size="16" /> Submit for Review</>
              }
            </button>
            <button className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-card)', border: '1px solid var(--brand-green)', borderRadius: 'var(--radius-md)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 999, boxShadow: 'var(--shadow-card)', fontSize: '0.88rem', color: 'var(--text-primary)', maxWidth: 380 }}>
          <UilCheck size="18" style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
          {toast}
        </div>
      )}
    </div>
  );
}
