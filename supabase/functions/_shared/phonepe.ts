import { PhonePeMode } from "./store-settings.ts";

interface PhonePeConfig {
  mode: PhonePeMode;
  apiBaseUrl: string;
  authTokenUrl: string;
  clientId: string;
  clientSecret: string;
  clientVersion: string;
}

interface PhonePeAuthTokenResponse {
  access_token?: string;
  expires_at?: number;
  expires_in?: number;
  expiresAt?: number;
  expiresIn?: number;
  message?: string;
}

interface TokenCacheEntry {
  accessToken: string;
  expiresAt: number;
}

const PHONEPE_API_BASE_URLS: Record<PhonePeMode, string> = {
  sandbox: "https://api-preprod.phonepe.com/apis/pg-sandbox",
  production: "https://api.phonepe.com/apis/pg",
};

const PHONEPE_AUTH_TOKEN_URLS: Record<PhonePeMode, string> = {
  sandbox: "https://api-preprod.phonepe.com/apis/identity-manager/v1/oauth/token",
  production: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
};

const TOKEN_CACHE_BY_MODE: Partial<Record<PhonePeMode, TokenCacheEntry>> = {};

const readFirstAvailableEnv = (keys: string[]) => {
  for (const key of keys) {
    const value = Deno.env.get(key)?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
};

const getCredentialKeys = (mode: PhonePeMode) => {
  if (mode === "production") {
    return {
      clientId: ["PHONEPE_CLIENT_ID_PRODUCTION", "PHONEPE_CLIENT_ID_PROD", "PHONEPE_CLIENT_ID"],
      clientSecret: ["PHONEPE_CLIENT_SECRET_PRODUCTION", "PHONEPE_CLIENT_SECRET_PROD", "PHONEPE_CLIENT_SECRET"],
      clientVersion: ["PHONEPE_CLIENT_VERSION_PRODUCTION", "PHONEPE_CLIENT_VERSION_PROD", "PHONEPE_CLIENT_VERSION"],
    };
  }

  return {
    clientId: ["PHONEPE_CLIENT_ID_SANDBOX", "PHONEPE_CLIENT_ID_UAT", "PHONEPE_CLIENT_ID"],
    clientSecret: ["PHONEPE_CLIENT_SECRET_SANDBOX", "PHONEPE_CLIENT_SECRET_UAT", "PHONEPE_CLIENT_SECRET"],
    clientVersion: ["PHONEPE_CLIENT_VERSION_SANDBOX", "PHONEPE_CLIENT_VERSION_UAT", "PHONEPE_CLIENT_VERSION"],
  };
};

const getTokenExpiry = (tokenResponse: PhonePeAuthTokenResponse) => {
  const explicitExpiry =
    tokenResponse.expires_at ??
    tokenResponse.expiresAt ??
    (typeof tokenResponse.expires_in === "number" ? Date.now() + tokenResponse.expires_in * 1000 : undefined) ??
    (typeof tokenResponse.expiresIn === "number" ? Date.now() + tokenResponse.expiresIn * 1000 : undefined);

  if (typeof explicitExpiry === "number" && Number.isFinite(explicitExpiry) && explicitExpiry > 0) {
    // If value is in seconds epoch, convert to milliseconds.
    if (explicitExpiry < 1_000_000_000_000) {
      return explicitExpiry * 1000;
    }
    return explicitExpiry;
  }

  // Fallback 15 minutes when token expiry metadata is unavailable.
  return Date.now() + 15 * 60 * 1000;
};

export const getPhonePeConfig = (mode: PhonePeMode): PhonePeConfig => {
  const credentialKeys = getCredentialKeys(mode);
  const clientId = readFirstAvailableEnv(credentialKeys.clientId);
  const clientSecret = readFirstAvailableEnv(credentialKeys.clientSecret);
  const clientVersion = readFirstAvailableEnv(credentialKeys.clientVersion) || "1";

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing PhonePe credentials for ${mode} mode. Set ${credentialKeys.clientId.join(" / ")} and ${credentialKeys.clientSecret.join(" / ")}.`
    );
  }

  return {
    mode,
    apiBaseUrl: PHONEPE_API_BASE_URLS[mode],
    authTokenUrl: PHONEPE_AUTH_TOKEN_URLS[mode],
    clientId,
    clientSecret,
    clientVersion,
  };
};

export const getPhonePeAuthorizationHeader = async (config: PhonePeConfig): Promise<string> => {
  const cachedEntry = TOKEN_CACHE_BY_MODE[config.mode];
  if (cachedEntry && cachedEntry.expiresAt > Date.now() + 20_000) {
    return `O-Bearer ${cachedEntry.accessToken}`;
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_version: config.clientVersion,
    client_secret: config.clientSecret,
    grant_type: "client_credentials",
  }).toString();

  const response = await fetch(config.authTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const responseBodyText = await response.text();
  let authResponse: PhonePeAuthTokenResponse | null = null;

  try {
    authResponse = responseBodyText ? (JSON.parse(responseBodyText) as PhonePeAuthTokenResponse) : null;
  } catch {
    // Non-JSON response handled below.
  }

  if (!response.ok) {
    throw new Error(authResponse?.message || `PhonePe OAuth token request failed (${response.status}).`);
  }

  const accessToken = authResponse?.access_token;
  if (!accessToken) {
    throw new Error("PhonePe OAuth token response did not include access_token.");
  }

  const expiresAt = getTokenExpiry(authResponse ?? {});
  TOKEN_CACHE_BY_MODE[config.mode] = {
    accessToken,
    expiresAt: expiresAt - 60_000,
  };

  return `O-Bearer ${accessToken}`;
};
