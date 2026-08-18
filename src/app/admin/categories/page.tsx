'use client';
import { useState } from 'react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import {
  UilPlus, UilEdit, UilTrashAlt, UilCheck, UilTimes, UilMobileAndroid,
  UilTablet, UilLaptop, UilHeadphones, UilCamera, UilPlug, UilBolt,
  UilWifi, UilBatteryBolt, UilWatch, UilHistory, UilTvRetro,
  UilArrowUp, UilArrowDown,
} from '@/components/Icons';
import styles from '../layout.module.css';

const INITIAL_CATS = PRODUCT_CATEGORIES.map((c, i) => ({ ...c, active: true, order: i }));

const ICON_MAP: Record<string, React.ComponentType<{ size?: string | number; style?: React.CSSProperties }>> = {
  smartphones: UilMobileAndroid, tablets: UilTablet, laptops: UilLaptop,
  tvs: UilTvRetro, audio: UilHeadphones, cameras: UilCamera,
  accessories: UilPlug, gaming: UilBolt, networking: UilWifi,
  powerbanks: UilBatteryBolt, smartwatches: UilWatch, refurbished: UilHistory,
};

export default function AdminCategories() {
  const [cats, setCats] = useState(INITIAL_CATS);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ id: '', label: '', color: '#3B82F6' });
  const [toast, setToast] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const startEdit = (cat: typeof cats[0]) => { setEditId(cat.id); setEditLabel(cat.label); setEditColor(cat.color); };
  const saveEdit = () => {
    setCats(prev => prev.map(c => c.id === editId ? { ...c, label: editLabel, color: editColor } : c));
    setEditId(null);
    showToast('Category updated');
  };

  const toggleActive = (id: string) => {
    setCats(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    showToast('Category visibility updated');
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...cats];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setCats(next);
  };

  const moveDown = (i: number) => {
    if (i === cats.length - 1) return;
    const next = [...cats];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setCats(next);
  };

  const handleAdd = () => {
    if (!newCat.id || !newCat.label) return;
    setCats(prev => [...prev, { ...newCat, icon: '', active: true, order: prev.length }]);
    setNewCat({ id: '', label: '', color: '#3B82F6' });
    setShowAdd(false);
    showToast('Category added');
  };

  const handleDelete = (id: string) => {
    setCats(prev => prev.filter(c => c.id !== id));
    setConfirmId(null);
    showToast('Category deleted');
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSub}>{cats.filter(c => c.active).length} active / {cats.length} total categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {showAdd ? <UilTimes size="16" /> : <UilPlus size="16" />}
          {showAdd ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className={styles.formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>New Category</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ID (slug) *</label>
              <input className={styles.formInput} placeholder="e.g. drones" value={newCat.id} onChange={e => setNewCat(p => ({ ...p, id: e.target.value.toLowerCase().replace(/\s/g, '-') }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Display Name *</label>
              <input className={styles.formInput} placeholder="e.g. Drones & FPV" value={newCat.label} onChange={e => setNewCat(p => ({ ...p, label: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Accent Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={newCat.color} onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))}
                  style={{ width: 44, height: 36, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'none' }} />
                <input className={styles.formInput} value={newCat.color} onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))} style={{ flex: 1 }} />
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn btn-primary" onClick={handleAdd}>Add Category</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cats.map((cat, i) => {
          const IconComp = ICON_MAP[cat.id];
          const isEditing = editId === cat.id;
          return (
            <div key={cat.id} className={styles.catCard} style={{ opacity: cat.active ? 1 : 0.5 }}>
              {/* Colored icon box */}
              <div className={styles.catIconBox} style={{ background: `${cat.color}18` }}>
                {IconComp ? <IconComp size="22" style={{ color: cat.color }} /> : (
                  <span style={{ color: cat.color, fontWeight: 900, fontSize: '1rem' }}>{cat.label.charAt(0)}</span>
                )}
              </div>

              {/* Info / edit */}
              <div className={styles.catInfo}>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input className={styles.formInput} value={editLabel} onChange={e => setEditLabel(e.target.value)} style={{ maxWidth: 200 }} />
                    <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                      style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }} />
                    <button className="btn btn-primary btn-xs" onClick={saveEdit} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><UilCheck size="14" /> Save</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className={styles.catName}>{cat.label}</div>
                    <div className={styles.catMeta}>/{cat.id} &bull; {cat.active ? 'Visible' : 'Hidden'}</div>
                  </>
                )}
              </div>

              {/* Order controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button className="btn btn-ghost btn-xs" onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: '2px 6px' }}><UilArrowUp size="14" /></button>
                <button className="btn btn-ghost btn-xs" onClick={() => moveDown(i)} disabled={i === cats.length - 1} style={{ padding: '2px 6px' }}><UilArrowDown size="14" /></button>
              </div>

              {/* Actions */}
              <div className={styles.catActions}>
                <button className="btn btn-ghost btn-xs" onClick={() => startEdit(cat)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UilEdit size="13" /> Edit
                </button>
                <button
                  className={`btn btn-sm ${cat.active ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => toggleActive(cat.id)}
                  style={{ fontSize: '0.75rem' }}
                >
                  {cat.active ? 'Hide' : 'Show'}
                </button>
                <button className="btn btn-danger btn-xs" onClick={() => setConfirmId(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UilTrashAlt size="13" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm */}
      {confirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Delete Category?</h3>
            <p className={styles.modalText}>All products in this category will lose their category assignment. This cannot be undone.</p>
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

