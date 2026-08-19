'use client';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { PRODUCT_CATEGORIES, formatRWF } from '@/lib/constants';
import type { Product } from '@/lib/types';
import {
  UilSearch, UilPlus, UilEdit, UilTrashAlt, UilEye, UilFire, UilCheck,
  UilStar, UilFilter, UilTimes, UilImages, UilCamera, UilUpload, UilRefresh,
} from '@/components/Icons';
import styles from '../layout.module.css';
import uploadStyles from './products.module.css';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [featured, setFeatured] = useState<string[]>(['1', '3']);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', category: 'smartphones', seller: '', description: '' });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load admin products', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.seller || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchSearch && matchCat;
  }), [products, search, catFilter]);

  const toggleFeatured = (id: string) => {
    setFeatured(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    showToast(featured.includes(id) ? 'Removed from featured' : 'Added to featured');
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
    setProducts(prev => prev.filter(p => p.id !== id));
    setConfirmId(null);
    showToast('Product removed successfully');
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const toAdd = Array.from(files).slice(0, 5 - uploadedImages.length);
    toAdd.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setUploadedImages(prev => prev.length < 5 ? [...prev, result] : prev);
      };
      reader.readAsDataURL(file);
    });
  }, [uploadedImages.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const removeImage = (idx: number) => setUploadedImages(prev => prev.filter((_, i) => i !== idx));

  const handleAddProduct = () => {
    if (!newProduct.title || !newProduct.price) return;
    const coverImage = uploadedImages[0] || 'https://placehold.co/80x80/0a1628/00A550?text=P';
    const prod: Product = {
      id: Date.now().toString(), title: newProduct.title, price: Number(newProduct.price),
      category: newProduct.category, seller: newProduct.seller || 'Admin',
      rating: 4.0, image: coverImage,
    };
    setProducts(prev => [prod, ...prev]);
    setShowAdd(false);
    setNewProduct({ title: '', price: '', category: 'smartphones', seller: '', description: '' });
    setUploadedImages([]);
    showToast('Product added successfully');
  };

  const resetForm = () => { setShowAdd(false); setUploadedImages([]); setNewProduct({ title: '', price: '', category: 'smartphones', seller: '', description: '' }); };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Products</h1>
          <p className={styles.pageSub}>{products.length} total products on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showAdd ? <UilTimes size="16" /> : <UilPlus size="16" />}
          {showAdd ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className={styles.formCard}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>New Product</h3>

          <div className={uploadStyles.formLayout}>
            {/* LEFT: Image Upload */}
            <div className={uploadStyles.imageSection}>
              <label className={styles.formLabel} style={{ marginBottom: 8, display: 'block' }}>
                Product Images <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(up to 5)</span>
              </label>

              {/* Drop Zone */}
              <div
                className={`${uploadStyles.dropZone} ${isDragging ? uploadStyles.dropZoneDragging : ''} ${uploadedImages.length >= 5 ? uploadStyles.dropZoneFull : ''}`}
                onClick={() => uploadedImages.length < 5 && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {uploadedImages.length === 0 ? (
                  <div className={uploadStyles.dropZoneEmpty}>
                    <div className={uploadStyles.dropIcon}>
                      <UilImages size="32" style={{ color: 'var(--brand-green)' }} />
                    </div>
                    <p className={uploadStyles.dropTitle}>Drag & drop images here</p>
                    <p className={uploadStyles.dropSub}>or click to browse — JPG, PNG, WEBP up to 5MB each</p>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, pointerEvents: 'none' }}>
                      <UilCamera size="14" /> Browse Files
                    </button>
                  </div>
                ) : (
                  <div className={uploadStyles.previewGrid}>
                    {uploadedImages.map((src, idx) => (
                      <div key={idx} className={`${uploadStyles.previewItem} ${idx === 0 ? uploadStyles.previewCover : ''}`}>
                        <img src={src} alt={`Product ${idx + 1}`} className={uploadStyles.previewImg} />
                        {idx === 0 && <span className={uploadStyles.coverBadge}>Cover</span>}
                        <button className={uploadStyles.removeBtn} onClick={e => { e.stopPropagation(); removeImage(idx); }} title="Remove image">
                          <UilTimes size="12" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 5 && (
                      <div className={uploadStyles.addMore}>
                        <UilPlus size="20" style={{ color: 'var(--text-muted)' }} />
                        <span>Add more</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                First image will be used as the product cover.
              </p>
            </div>

            {/* RIGHT: Product Fields */}
            <div className={uploadStyles.fieldsSection}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Product Title *</label>
                <input className={styles.formInput} placeholder="e.g. Samsung Galaxy S25 Ultra" value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price (RWF) *</label>
                  <input className={styles.formInput} type="number" placeholder="850000" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <select className={styles.formSelect} value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Seller Name</label>
                <input className={styles.formInput} placeholder="Store name (optional — defaults to Admin)" value={newProduct.seller} onChange={e => setNewProduct(p => ({ ...p, seller: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formInput}
                  rows={3}
                  placeholder="Describe the product — specs, features, warranty..."
                  value={newProduct.description}
                  onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
              <div className={styles.formActions}>
                <button className="btn btn-primary" onClick={handleAddProduct} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UilCheck size="16" /> Save Product
                </button>
                <button className="btn btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => processFiles(e.target.files)}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="16" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input className={styles.searchInput} placeholder="Search products or sellers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Product</th><th>Seller</th><th>Price</th><th>Category</th><th>Discount %</th><th>Rating</th><th>Featured</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className={styles.productCell}>
                    <img src={p.image} alt={p.title} className={styles.productThumb} onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/40x40/0a1628/00A550?text=P'; }} />
                    <span className={styles.tdPrimary} style={{ fontSize: '0.85rem' }}>{p.title}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{p.seller}</td>
                <td className={styles.tdAmount}>{formatRWF(p.price)}</td>
                <td><span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{p.category}</span></td>
                <td>
                  <input
                    type="number" min="0" max="80" placeholder="0"
                    value={discounts[p.id] || ''}
                    onChange={e => setDiscounts(prev => ({ ...prev, [p.id]: e.target.value }))}
                    style={{ width: 64, padding: '4px 8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 3 }}>%</span>
                </td>
                <td style={{ color: '#F59E0B' }}>★ {p.rating}</td>
                <td>
                  <button onClick={() => toggleFeatured(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title={featured.includes(p.id) ? 'Remove from featured' : 'Mark as featured'}>
                    <UilStar size="18" style={{ color: featured.includes(p.id) ? '#F59E0B' : 'var(--text-muted)' }} />
                  </button>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <a href={`/products/${p.id}`} target="_blank" className="btn btn-ghost btn-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UilEye size="13" /> View
                    </a>
                    <button className="btn btn-danger btn-xs" onClick={() => setConfirmId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UilTrashAlt size="13" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Product?</h3>
            <p className={styles.modalText}>This will permanently remove the product from the platform. This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}
