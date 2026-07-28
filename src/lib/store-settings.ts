export interface StoreSettings {
  id: number;
  store_name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  whatsapp_number: string;
  free_shipping_threshold: number;
  shipping_cost: number;
  cod_enabled: boolean;
  razorpay_enabled: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 1,
  store_name: "Shrihit",
  tagline: "Sacred Craftsmanship for Divine Moments",
  email: "contact@shrihit.in",
  phone: "+91 98765 43210",
  address: "Moradabad, Uttar Pradesh, India",
  whatsapp_number: "+919876543210",
  free_shipping_threshold: 999,
  shipping_cost: 99,
  cod_enabled: true,
  razorpay_enabled: true,
};

export const normalizeStoreSettings = (settings: Partial<StoreSettings> | null | undefined): StoreSettings => ({
  ...DEFAULT_STORE_SETTINGS,
  ...settings,
});
