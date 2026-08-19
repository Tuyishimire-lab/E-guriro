'use client';
import { useState, useEffect } from 'react';
import { DELIVERY_FEES, PICKUP_STATIONS, type PickupStation } from '@/lib/constants';
import {
  UilStore, UilTruck, UilCreditCard, UilShield, UilMoneyBill,
  UilCheck, UilStar, UilMapMarker, UilPlus, UilTrashAlt,
  UilClock, UilPhone,
} from '@/components/Icons';
import styles from '../layout.module.css';

export default function AdminSettings() {
  const [platform, setPlatform] = useState({
    name: 'RwandaBuy',
    tagline: "Rwanda's #1 Electronics & Phone Store",
    supportEmail: 'support@rwandabuy.rw',
    supportPhone: '+250 788 000 000',
    currency: 'RWF',
  });
  const [commission, setCommission] = useState(8);
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number>>(DELIVERY_FEES);
  const [pickupStations, setPickupStations] = useState<PickupStation[]>(PICKUP_STATIONS);
  const [pickupFee, setPickupFee] = useState(1000);
  const [freePickupThreshold, setFreePickupThreshold] = useState(50000);

  const [newStation, setNewStation] = useState<Omit<PickupStation, 'id'>>({
    name: '',
    district: 'Nyarugenge',
    landmark: '',
    address: '',
    hours: 'Mon – Sat: 8:00 AM – 8:00 PM',
    phone: '+250 788 000 000',
    popular: false,
  });
  const [showAddStation, setShowAddStation] = useState(false);

  const [payments, setPayments] = useState({
    mtnMomo: true,
    airtelMoney: true,
    visa: true,
    mastercard: true,
    bankTransfer: true,
  });
  const [features, setFeatures] = useState({
    flashSales: true,
    reviews: true,
    wishlist: true,
    compareProducts: true,
    sellerChat: true,
    selfRegistration: true,
  });
  const [maintenance, setMaintenance] = useState(false);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.name) {
            setPlatform({
              name: data.name,
              tagline: data.tagline,
              supportEmail: data.supportEmail,
              supportPhone: data.supportPhone,
              currency: data.currency,
            });
          }
          if (typeof data.commission === 'number') setCommission(data.commission);
          if (data.deliveryFees) setDeliveryFees(data.deliveryFees);
          if (Array.isArray(data.pickupStations) && data.pickupStations.length > 0) {
            setPickupStations(data.pickupStations);
          }
          if (typeof data.pickupFee === 'number') setPickupFee(data.pickupFee);
          if (typeof data.freePickupThreshold === 'number') setFreePickupThreshold(data.freePickupThreshold);
          if (data.payments) setPayments(data.payments);
          if (data.features) setFeatures(data.features);
          if (typeof data.maintenance === 'boolean') setMaintenance(data.maintenance);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    }
    loadSettings();
  }, []);

  const saveSettingsToDb = async (partial: Record<string, unknown>, successMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        showToast(successMsg);
      } else {
        showToast('Failed to save settings. Please try again.');
      }
    } catch (e) {
      console.error(e);
      showToast('Network error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const savePlatform = () => saveSettingsToDb({ ...platform }, 'Platform identity settings saved to database');
  const saveCommission = () => saveSettingsToDb({ commission }, `Commission rate set to ${commission}% in database`);
  const saveDeliveryFees = () => saveSettingsToDb({ deliveryFees }, 'Delivery fees updated across all 5 provinces in database');
  const savePayments = () => saveSettingsToDb({ payments }, 'Payment method configuration saved to database');
  const saveFeatures = () => saveSettingsToDb({ features }, 'Platform feature toggles saved to database');

  const handleAddStation = () => {
    if (!newStation.name.trim() || !newStation.landmark.trim()) {
      showToast('Please enter a station name and landmark description.');
      return;
    }
    const created: PickupStation = {
      id: `ps-${Date.now().toString(36)}`,
      ...newStation,
    };
    const updated = [...pickupStations, created];
    setPickupStations(updated);
    setShowAddStation(false);
    setNewStation({
      name: '',
      district: 'Nyarugenge',
      landmark: '',
      address: '',
      hours: 'Mon – Sat: 8:00 AM – 8:00 PM',
      phone: '+250 788 000 000',
      popular: false,
    });
    saveSettingsToDb({ pickupStations: updated, pickupFee, freePickupThreshold }, `Station "${created.name}" added successfully`);
  };

  const handleDeleteStation = (id: string, name: string) => {
    const updated = pickupStations.filter(s => s.id !== id);
    setPickupStations(updated);
    saveSettingsToDb({ pickupStations: updated, pickupFee, freePickupThreshold }, `Station "${name}" removed`);
  };

  const savePickupStationConfig = () => {
    saveSettingsToDb(
      { pickupStations, pickupFee, freePickupThreshold },
      'Kigali Pickup Stations and pricing saved to database'
    );
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSub}>Global platform configuration, Pickup Stations & database controls</p>
        </div>
      </div>

      {/* Platform Identity */}
      <div className={styles.settingSection}>
        <div className={styles.settingSectionHeader}>
          <UilStore size="18" style={{ color: 'var(--brand-green)' }} />
          <span className={styles.settingSectionTitle}>Platform Identity</span>
        </div>
        <div className={styles.settingSectionBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Platform Name</label>
              <input className={styles.formInput} value={platform.name} onChange={e => setPlatform(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tagline</label>
              <input className={styles.formInput} value={platform.tagline} onChange={e => setPlatform(p => ({ ...p, tagline: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Support Email</label>
              <input className={styles.formInput} type="email" value={platform.supportEmail} onChange={e => setPlatform(p => ({ ...p, supportEmail: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Support Phone</label>
              <input className={styles.formInput} value={platform.supportPhone} onChange={e => setPlatform(p => ({ ...p, supportPhone: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={savePlatform} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ─── Kigali Pickup Stations (Click & Collect) ─── */}
      <div className={styles.settingSection}>
        <div className={styles.settingSectionHeader} style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UilMapMarker size="18" style={{ color: 'var(--brand-green)' }} />
            <span className={styles.settingSectionTitle}>Kigali Pickup Stations (Click & Collect)</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => setShowAddStation(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <UilPlus size="13" /> {showAddStation ? 'Close Form' : 'Add Pickup Station'}
          </button>
        </div>

        <div className={styles.settingSectionBody}>
          <div className={styles.formGrid} style={{ marginBottom: 16 }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Standard Pickup Fee</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>RWF</span>
                <input
                  className={styles.formInput}
                  type="number"
                  value={pickupFee}
                  onChange={e => setPickupFee(Number(e.target.value))}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Free Pickup Threshold</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>RWF</span>
                <input
                  className={styles.formInput}
                  type="number"
                  value={freePickupThreshold}
                  onChange={e => setFreePickupThreshold(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Add Station Form */}
          {showAddStation && (
            <div style={{ background: 'rgba(0,165,80,0.05)', border: '1px solid rgba(0,165,80,0.25)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-green)' }}>
                📍 Add New Pickup Station
              </h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Station Name</label>
                  <input
                    className={styles.formInput}
                    placeholder="e.g. Nyabugogo Central Hub"
                    value={newStation.name}
                    onChange={e => setNewStation(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>District</label>
                  <select
                    className={styles.formInput}
                    value={newStation.district}
                    onChange={e => setNewStation(p => ({ ...p, district: e.target.value }))}
                  >
                    <option value="Nyarugenge">Nyarugenge</option>
                    <option value="Gasabo">Gasabo</option>
                    <option value="Kicukiro">Kicukiro</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Landmark Description</label>
                  <input
                    className={styles.formInput}
                    placeholder="e.g. Ground Floor, Near Taxi Park Main Gate"
                    value={newStation.landmark}
                    onChange={e => setNewStation(p => ({ ...p, landmark: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Street Address</label>
                  <input
                    className={styles.formInput}
                    placeholder="e.g. KN 1 Rd, Nyabugogo"
                    value={newStation.address}
                    onChange={e => setNewStation(p => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Operating Hours</label>
                  <input
                    className={styles.formInput}
                    placeholder="e.g. Mon – Sat: 8:00 AM – 8:00 PM"
                    value={newStation.hours}
                    onChange={e => setNewStation(p => ({ ...p, hours: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Hub Contact Phone</label>
                  <input
                    className={styles.formInput}
                    placeholder="+250 788 XXX XXX"
                    value={newStation.phone}
                    onChange={e => setNewStation(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddStation}>
                  Save Station
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddStation(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Stations List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {pickupStations.map(st => (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.92rem' }}>{st.name}</strong>
                    <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{st.district}</span>
                    {st.popular && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Popular</span>}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📍 {st.landmark} &nbsp;·&nbsp; 🕒 {st.hours} &nbsp;·&nbsp; 📞 {st.phone}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-danger btn-xs"
                  onClick={() => handleDeleteStation(st.id, st.name)}
                  title="Remove Station"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <UilTrashAlt size="12" /> Remove
                </button>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-sm" onClick={savePickupStationConfig} disabled={saving}>
            {saving ? 'Saving...' : 'Save Pickup Station Settings'}
          </button>
        </div>
      </div>

      {/* Commission Rate */}
      <div className={styles.settingSection}>
        <div className={styles.settingSectionHeader}>
          <UilMoneyBill size="18" style={{ color: 'var(--brand-green)' }} />
          <span className={styles.settingSectionTitle}>Commission Rate</span>
        </div>
        <div className={styles.settingSectionBody}>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingRowLabel}>Platform Commission</div>
              <div className={styles.settingRowSub}>Percentage taken from each completed sale</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={commission}
                onChange={e => setCommission(Number(e.target.value))}
                style={{ width: 180, accentColor: 'var(--brand-green)' }}
              />
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-green)', minWidth: 56 }}>{commission}%</span>
            </div>
          </div>
          <div style={{ background: 'rgba(0,165,80,0.06)', border: '1px solid rgba(0,165,80,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            At {commission}% commission: on a RWF 500,000 sale, RwandaBuy earns RWF {(500000 * commission / 100).toLocaleString()} and the seller receives RWF {(500000 * (1 - commission / 100)).toLocaleString()}.
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveCommission} disabled={saving}>
            {saving ? 'Updating...' : 'Update Rate'}
          </button>
        </div>
      </div>

      {/* Delivery Fees */}
      <div className={styles.settingSection}>
        <div className={styles.settingSectionHeader}>
          <UilTruck size="18" style={{ color: 'var(--brand-green)' }} />
          <span className={styles.settingSectionTitle}>Delivery Fees by Province</span>
        </div>
        <div className={styles.settingSectionBody}>
          <div className={styles.formGrid}>
            {Object.entries(deliveryFees).map(([province, fee]) => (
              <div key={province} className={styles.formGroup}>
                <label className={styles.formLabel}>{province}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>RWF</span>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={fee}
                    onChange={e => setDeliveryFees(prev => ({ ...prev, [province]: Number(e.target.value) }))}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveDeliveryFees} disabled={saving}>
            {saving ? 'Saving...' : 'Save Delivery Fees'}
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={styles.settingSection}>
        <div className={styles.settingSectionHeader}>
          <UilCreditCard size="18" style={{ color: 'var(--brand-green)' }} />
          <span className={styles.settingSectionTitle}>Payment Methods</span>
        </div>
        <div className={styles.settingSectionBody}>
          {([
            ['mtnMomo', 'MTN Mobile Money', 'Dial *182# to confirm payment'],
            ['airtelMoney', 'Airtel Money', 'Dial *185# to confirm payment'],
            ['visa', 'Visa Card', 'Secure online card payments'],
            ['mastercard', 'Mastercard', 'Secure online card payments'],
            ['bankTransfer', 'Bank Transfer', 'All Rwandan commercial banks'],
          ] as const).map(([key, label, sub]) => (
            <div key={key} className={styles.settingRow}>
              <div>
                <div className={styles.settingRowLabel}>{label}</div>
                <div className={styles.settingRowSub}>{sub}</div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={payments[key]}
                  onChange={e => {
                    const next = { ...payments, [key]: e.target.checked };
                    setPayments(next);
                    saveSettingsToDb({ payments: next }, `${label} ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={savePayments} disabled={saving}>
            {saving ? 'Saving...' : 'Save Payment Methods'}
          </button>
        </div>
      </div>

      {/* Platform Features */}
      <div className={styles.settingSection}>
        <div className={styles.settingSectionHeader}>
          <UilStar size="18" style={{ color: 'var(--brand-green)' }} />
          <span className={styles.settingSectionTitle}>Platform Features</span>
        </div>
        <div className={styles.settingSectionBody}>
          {([
            ['flashSales', 'Flash Sales', 'Enable timed flash sale promotions'],
            ['reviews', 'Product Reviews', 'Allow buyers to leave product reviews'],
            ['wishlist', 'Wishlists', 'Allow buyers to save products to a wishlist'],
            ['compareProducts', 'Product Comparison', 'Enable side-by-side product comparison'],
            ['sellerChat', 'Seller Chat', 'Enable buyer-seller direct messaging'],
            ['selfRegistration', 'Seller Self-Registration', 'Allow anyone to apply to become a seller'],
          ] as const).map(([key, label, sub]) => (
            <div key={key} className={styles.settingRow}>
              <div>
                <div className={styles.settingRowLabel}>{label}</div>
                <div className={styles.settingRowSub}>{sub}</div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={features[key]}
                  onChange={e => {
                    const next = { ...features, [key]: e.target.checked };
                    setFeatures(next);
                    saveSettingsToDb({ features: next }, `${label} ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          ))}
          <button className="btn btn-primary btn-sm" onClick={saveFeatures} disabled={saving}>
            {saving ? 'Saving...' : 'Save Features'}
          </button>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className={styles.settingSection} style={{ borderColor: maintenance ? 'rgba(239,68,68,0.5)' : undefined }}>
        <div className={styles.settingSectionHeader} style={{ background: maintenance ? 'rgba(239,68,68,0.08)' : undefined }}>
          <UilShield size="18" style={{ color: maintenance ? 'var(--color-error)' : 'var(--brand-green)' }} />
          <span className={styles.settingSectionTitle} style={{ color: maintenance ? 'var(--color-error)' : undefined }}>
            Maintenance Mode {maintenance ? '— ACTIVE' : ''}
          </span>
        </div>
        <div className={styles.settingSectionBody}>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingRowLabel}>Enable Maintenance Mode</div>
              <div className={styles.settingRowSub}>When enabled, visitors will see a maintenance page. Admins can still access the panel.</div>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={maintenance}
                onChange={e => {
                  setMaintenance(e.target.checked);
                  saveSettingsToDb(
                    { maintenance: e.target.checked },
                    e.target.checked ? 'Maintenance mode ENABLED' : 'Maintenance mode disabled'
                  );
                }}
              />
              <span className={styles.toggleSlider} style={{ background: maintenance ? 'var(--color-error)' : undefined, borderColor: maintenance ? 'var(--color-error)' : undefined }} />
            </label>
          </div>
        </div>
      </div>

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}
