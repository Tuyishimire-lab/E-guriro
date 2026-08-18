/**
 * Edge Config — Platform Settings
 * Reads from Vercel Edge Config (ultra-low latency, global).
 * Falls back to sensible defaults so the app works even before config is populated.
 */
import { createClient } from '@vercel/edge-config';

export interface PlatformConfig {
  maintenanceMode: boolean;
  commissionRate: number;
  shippingFees: Record<string, number>;
  featuredSellerIds: string[];
  paymentMethods: { mtnMomo: boolean; airtelMoney: boolean; card: boolean };
  features: { chat: boolean; wishlist: boolean; reviews: boolean; flashSales: boolean };
}

const DEFAULTS: PlatformConfig = {
  maintenanceMode: false,
  commissionRate: 8,
  shippingFees: {
    'Kigali City':       1500,
    'Eastern Province':  3000,
    'Western Province':  3000,
    'Northern Province': 3000,
    'Southern Province': 3000,
  },
  featuredSellerIds: [],
  paymentMethods: { mtnMomo: true, airtelMoney: true, card: false },
  features:        { chat: true, wishlist: true, reviews: true, flashSales: true },
};

const edgeConfigClient = createClient(process.env.EDGE_CONFIG!);

export async function getConfig(): Promise<PlatformConfig> {
  try {
    const cfg = await edgeConfigClient.getAll();
    if (!cfg || Object.keys(cfg).length === 0) return DEFAULTS;
    return {
      maintenanceMode:  (cfg.maintenanceMode  as boolean)          ?? DEFAULTS.maintenanceMode,
      commissionRate:   (cfg.commissionRate   as number)           ?? DEFAULTS.commissionRate,
      shippingFees:     (cfg.shippingFees     as Record<string, number>) ?? DEFAULTS.shippingFees,
      featuredSellerIds:(cfg.featuredSellerIds as string[])        ?? DEFAULTS.featuredSellerIds,
      paymentMethods:   (cfg.paymentMethods   as PlatformConfig['paymentMethods']) ?? DEFAULTS.paymentMethods,
      features:         (cfg.features         as PlatformConfig['features'])       ?? DEFAULTS.features,
    };
  } catch {
    // Edge Config unavailable in local dev without the env var set — use defaults
    return DEFAULTS;
  }
}

export function getShippingFee(district: string, config: PlatformConfig): number {
  const kigaliDistricts = ['Nyarugenge', 'Gasabo', 'Kicukiro'];
  const province = kigaliDistricts.includes(district) ? 'Kigali City' : getProvince(district);
  return config.shippingFees[province] ?? config.shippingFees['Eastern Province'] ?? 3000;
}

function getProvince(district: string): string {
  const map: Record<string, string> = {
    Nyarugenge: 'Kigali City', Gasabo: 'Kigali City', Kicukiro: 'Kigali City',
    Bugesera: 'Eastern Province', Gatsibo: 'Eastern Province', Kayonza: 'Eastern Province',
    Kirehe: 'Eastern Province', Ngoma: 'Eastern Province', Nyagatare: 'Eastern Province', Rwamagana: 'Eastern Province',
    Karongi: 'Western Province', Ngororero: 'Western Province', Nyabihu: 'Western Province',
    Nyamasheke: 'Western Province', Rubavu: 'Western Province', Rusizi: 'Western Province', Rutsiro: 'Western Province',
    Burera: 'Northern Province', Gakenke: 'Northern Province', Gicumbi: 'Northern Province',
    Musanze: 'Northern Province', Rulindo: 'Northern Province',
    Gisagara: 'Southern Province', Huye: 'Southern Province', Kamonyi: 'Southern Province',
    Muhanga: 'Southern Province', Nyamagabe: 'Southern Province', Nyanza: 'Southern Province',
    Nyaruguru: 'Southern Province', Ruhango: 'Southern Province',
  };
  return map[district] ?? 'Eastern Province';
}
