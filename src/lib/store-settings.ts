export const PHONEPE_MODE_OPTIONS = ["sandbox", "production"] as const;
export type PhonePeMode = (typeof PHONEPE_MODE_OPTIONS)[number];

export const PHONEPE_CHECKOUT_FLOW_OPTIONS = ["IFRAME", "REDIRECT"] as const;
export type PhonePeCheckoutFlow = (typeof PHONEPE_CHECKOUT_FLOW_OPTIONS)[number];

export const PHONEPE_PAYMENT_MODE_OPTIONS = [
  "UPI_INTENT",
  "UPI_COLLECT",
  "UPI_QR",
  "CARD",
  "NET_BANKING",
] as const;
export type PhonePePaymentMode = (typeof PHONEPE_PAYMENT_MODE_OPTIONS)[number];

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
  phonepe_enabled: boolean;
  phonepe_mode: PhonePeMode;
  phonepe_checkout_flow: PhonePeCheckoutFlow;
  phonepe_checkout_script_url: string;
  phonepe_enabled_payment_modes: PhonePePaymentMode[];
  phonepe_disable_payment_retry: boolean;
}

export const getDefaultPhonePeScriptUrl = (mode: PhonePeMode) =>
  mode === "production"
    ? "https://mercury.phonepe.com/web/bundle/checkout.js"
    : "https://mercury-stg.phonepe.com/web/bundle/checkout.js";

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
  phonepe_enabled: true,
  phonepe_mode: "sandbox",
  phonepe_checkout_flow: "IFRAME",
  phonepe_checkout_script_url: getDefaultPhonePeScriptUrl("sandbox"),
  phonepe_enabled_payment_modes: ["UPI_INTENT", "UPI_COLLECT", "UPI_QR"],
  phonepe_disable_payment_retry: false,
};

const normalizePaymentModes = (modes: unknown): PhonePePaymentMode[] => {
  if (!Array.isArray(modes)) {
    return DEFAULT_STORE_SETTINGS.phonepe_enabled_payment_modes;
  }

  const validModes = modes.filter((mode): mode is PhonePePaymentMode =>
    PHONEPE_PAYMENT_MODE_OPTIONS.includes(mode as PhonePePaymentMode)
  );

  return validModes.length > 0 ? validModes : DEFAULT_STORE_SETTINGS.phonepe_enabled_payment_modes;
};

export const normalizeStoreSettings = (settings: Partial<StoreSettings> | null | undefined): StoreSettings => {
  const mode = PHONEPE_MODE_OPTIONS.includes(settings?.phonepe_mode as PhonePeMode)
    ? (settings?.phonepe_mode as PhonePeMode)
    : DEFAULT_STORE_SETTINGS.phonepe_mode;

  const checkoutFlow = PHONEPE_CHECKOUT_FLOW_OPTIONS.includes(
    settings?.phonepe_checkout_flow as PhonePeCheckoutFlow
  )
    ? (settings?.phonepe_checkout_flow as PhonePeCheckoutFlow)
    : DEFAULT_STORE_SETTINGS.phonepe_checkout_flow;

  const configuredScriptUrl = settings?.phonepe_checkout_script_url?.trim();
  const checkoutScriptUrl = configuredScriptUrl || getDefaultPhonePeScriptUrl(mode);

  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    phonepe_mode: mode,
    phonepe_checkout_flow: checkoutFlow,
    phonepe_checkout_script_url: checkoutScriptUrl,
    phonepe_enabled_payment_modes: normalizePaymentModes(settings?.phonepe_enabled_payment_modes),
  };
};
