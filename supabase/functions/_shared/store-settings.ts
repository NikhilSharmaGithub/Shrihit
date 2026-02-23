export const PHONEPE_MODE_OPTIONS = ["sandbox", "production"] as const;
export type PhonePeMode = (typeof PHONEPE_MODE_OPTIONS)[number];

export const PHONEPE_PAYMENT_MODE_OPTIONS = [
  "UPI_INTENT",
  "UPI_COLLECT",
  "UPI_QR",
  "CARD",
  "NET_BANKING",
] as const;
export type PhonePePaymentMode = (typeof PHONEPE_PAYMENT_MODE_OPTIONS)[number];

export interface RuntimeStoreSettings {
  phonepeEnabled: boolean;
  phonepeMode: PhonePeMode;
  phonepeEnabledPaymentModes: PhonePePaymentMode[];
  phonepeDisablePaymentRetry: boolean;
}

interface StoreSettingsRow {
  phonepe_enabled?: boolean | null;
  phonepe_mode?: string | null;
  phonepe_enabled_payment_modes?: unknown;
  phonepe_disable_payment_retry?: boolean | null;
}

const DEFAULT_PHONEPE_MODE: PhonePeMode =
  Deno.env.get("PHONEPE_MODE")?.trim().toLowerCase() === "production" ? "production" : "sandbox";

const DEFAULT_RUNTIME_STORE_SETTINGS: RuntimeStoreSettings = {
  phonepeEnabled: true,
  phonepeMode: DEFAULT_PHONEPE_MODE,
  phonepeEnabledPaymentModes: ["UPI_INTENT", "UPI_COLLECT", "UPI_QR"],
  phonepeDisablePaymentRetry: false,
};

const SETTINGS_CACHE_TTL_MS = 30_000;
let settingsCache: { value: RuntimeStoreSettings; expiresAt: number } | null = null;

export const normalizePhonePeMode = (
  mode: unknown,
  fallback: PhonePeMode = DEFAULT_RUNTIME_STORE_SETTINGS.phonepeMode
): PhonePeMode => {
  if (typeof mode !== "string") {
    return fallback;
  }

  const normalizedMode = mode.trim().toLowerCase();
  if (normalizedMode === "sandbox" || normalizedMode === "production") {
    return normalizedMode;
  }

  return fallback;
};

const normalizePaymentModes = (paymentModes: unknown): PhonePePaymentMode[] => {
  if (!Array.isArray(paymentModes)) {
    return DEFAULT_RUNTIME_STORE_SETTINGS.phonepeEnabledPaymentModes;
  }

  const normalizedModes = paymentModes.filter((mode): mode is PhonePePaymentMode =>
    PHONEPE_PAYMENT_MODE_OPTIONS.includes(mode as PhonePePaymentMode)
  );

  if (normalizedModes.length === 0) {
    return DEFAULT_RUNTIME_STORE_SETTINGS.phonepeEnabledPaymentModes;
  }

  return normalizedModes;
};

const normalizeSettings = (settingsRow: StoreSettingsRow | null): RuntimeStoreSettings => {
  if (!settingsRow) {
    return DEFAULT_RUNTIME_STORE_SETTINGS;
  }

  return {
    phonepeEnabled: settingsRow.phonepe_enabled ?? DEFAULT_RUNTIME_STORE_SETTINGS.phonepeEnabled,
    phonepeMode: normalizePhonePeMode(settingsRow.phonepe_mode),
    phonepeEnabledPaymentModes: normalizePaymentModes(settingsRow.phonepe_enabled_payment_modes),
    phonepeDisablePaymentRetry:
      settingsRow.phonepe_disable_payment_retry ?? DEFAULT_RUNTIME_STORE_SETTINGS.phonepeDisablePaymentRetry,
  };
};

const shouldFallbackToDefaults = (status: number, bodyText: string) => {
  if (status === 404 || status === 406) {
    return true;
  }

  const normalizedBody = bodyText.toLowerCase();
  return (
    normalizedBody.includes("store_settings") &&
    (normalizedBody.includes("does not exist") ||
      normalizedBody.includes("pgrst205") ||
      normalizedBody.includes("42p01"))
  );
};

const fetchStoreSettings = async (): Promise<StoreSettingsRow | null> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const supabaseKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() || Deno.env.get("SUPABASE_ANON_KEY")?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const endpoint = new URL(`${supabaseUrl}/rest/v1/store_settings`);
  endpoint.searchParams.set("id", "eq.1");
  endpoint.searchParams.set(
    "select",
    "phonepe_enabled,phonepe_mode,phonepe_enabled_payment_modes,phonepe_disable_payment_retry"
  );

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
    },
  });

  const bodyText = await response.text();
  if (!response.ok) {
    if (shouldFallbackToDefaults(response.status, bodyText)) {
      return null;
    }

    throw new Error(`Failed to fetch store settings (${response.status}): ${bodyText}`);
  }

  let payload: unknown;
  try {
    payload = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    throw new Error("Invalid JSON response while fetching store settings.");
  }

  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  return payload[0] as StoreSettingsRow;
};

export const getRuntimeStoreSettings = async (): Promise<RuntimeStoreSettings> => {
  const now = Date.now();
  if (settingsCache && settingsCache.expiresAt > now) {
    return settingsCache.value;
  }

  try {
    const settings = normalizeSettings(await fetchStoreSettings());
    settingsCache = {
      value: settings,
      expiresAt: now + SETTINGS_CACHE_TTL_MS,
    };
    return settings;
  } catch (error) {
    console.error("Failed to load runtime store settings. Falling back to defaults.", error);
    return DEFAULT_RUNTIME_STORE_SETTINGS;
  }
};
