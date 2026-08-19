/**
 * Platform Settings Service — Neon Postgres
 * Persists global marketplace settings (commission rate, delivery fees, payment toggles, contact info)
 */
import { sql } from '@/lib/db';
import { DELIVERY_FEES } from '@/lib/constants';

export interface PlatformSettings {
  name: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  commission: number;
  deliveryFees: Record<string, number>;
  payments: {
    mtnMomo: boolean;
    airtelMoney: boolean;
    visa: boolean;
    mastercard: boolean;
    bankTransfer: boolean;
  };
  features: {
    flashSales: boolean;
    reviews: boolean;
    wishlist: boolean;
    compareProducts: boolean;
    sellerChat: boolean;
    selfRegistration: boolean;
  };
  maintenance: boolean;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  name: 'RwandaBuy',
  tagline: "Rwanda's #1 Electronics & Phone Store",
  supportEmail: 'support@rwandabuy.rw',
  supportPhone: '+250 788 000 000',
  currency: 'RWF',
  commission: 8,
  deliveryFees: DELIVERY_FEES,
  payments: {
    mtnMomo: true,
    airtelMoney: true,
    visa: true,
    mastercard: true,
    bankTransfer: true,
  },
  features: {
    flashSales: true,
    reviews: true,
    wishlist: true,
    compareProducts: true,
    sellerChat: true,
    selfRegistration: true,
  },
  maintenance: false,
};

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    await ensureTable();
    const rows = await sql`SELECT data FROM platform_settings WHERE id = 'global' LIMIT 1`;
    if (!rows.length) {
      // Initialize with default settings
      await sql`
        INSERT INTO platform_settings (id, data)
        VALUES ('global', ${JSON.stringify(DEFAULT_SETTINGS)})
        ON CONFLICT (id) DO NOTHING`;
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...rows[0].data };
  } catch (e) {
    console.error('Error fetching platform settings', e);
    return DEFAULT_SETTINGS;
  }
}

export async function updatePlatformSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
  await ensureTable();
  const current = await getPlatformSettings();
  const updated: PlatformSettings = {
    ...current,
    ...data,
    payments: { ...current.payments, ...(data.payments ?? {}) },
    features: { ...current.features, ...(data.features ?? {}) },
    deliveryFees: { ...current.deliveryFees, ...(data.deliveryFees ?? {}) },
  };

  await sql`
    INSERT INTO platform_settings (id, data, updated_at)
    VALUES ('global', ${JSON.stringify(updated)}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      data = ${JSON.stringify(updated)},
      updated_at = NOW()`;

  return updated;
}
