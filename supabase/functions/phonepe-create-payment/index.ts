import { corsHeaders } from "../_shared/cors.ts";
import { getPhonePeAuthorizationHeader, getPhonePeConfig } from "../_shared/phonepe.ts";
import { getRuntimeStoreSettings } from "../_shared/store-settings.ts";

interface CreatePaymentRequest {
  merchantOrderId: string;
  amount: number; // in paisa
  redirectUrl?: string;
  phonepeMode?: string; // ignored intentionally; mode is controlled via admin settings
}

interface PhonePeCreatePaymentResponseData {
  orderId?: string;
  redirectUrl?: string;
  state?: string;
  expiryAt?: number;
}

interface PhonePeCreatePaymentResponse {
  success?: boolean;
  code?: string;
  message?: string;
  data?: PhonePeCreatePaymentResponseData;
}

const getRedirectUrl = (req: Request, merchantOrderId: string, redirectUrl?: string) => {
  if (redirectUrl && /^https?:\/\//.test(redirectUrl)) {
    return redirectUrl;
  }

  const origin = req.headers.get("origin");
  if (!origin) {
    throw new Error("redirectUrl is required when request origin is unavailable.");
  }

  return `${origin}/phonepe-return?merchantOrderId=${encodeURIComponent(merchantOrderId)}`;
};

const validateRequest = ({ merchantOrderId, amount }: CreatePaymentRequest) => {
  if (!merchantOrderId) {
    throw new Error("merchantOrderId is required.");
  }

  if (!/^[A-Za-z0-9_-]{1,63}$/.test(merchantOrderId)) {
    throw new Error("merchantOrderId must be 1-63 chars and contain only letters, numbers, '-' or '_'.");
  }

  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error("amount must be an integer in paisa and at least 100.");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CreatePaymentRequest;
    validateRequest(payload);

    const storeSettings = await getRuntimeStoreSettings();
    if (!storeSettings.phonepeEnabled) {
      throw new Error("PhonePe is currently disabled by admin.");
    }

    const config = getPhonePeConfig(storeSettings.phonepeMode);
    const authorizationHeader = await getPhonePeAuthorizationHeader(config);

    const finalRedirectUrl = getRedirectUrl(req, payload.merchantOrderId, payload.redirectUrl);
    const paymentModeConfig: Record<string, unknown> = {
      enabledPaymentModes: storeSettings.phonepeEnabledPaymentModes.map((mode) => ({ type: mode })),
    };
    if (storeSettings.phonepeDisablePaymentRetry) {
      paymentModeConfig.disablePaymentRetry = true;
    }

    const createPaymentPayload = {
      merchantOrderId: payload.merchantOrderId,
      amount: payload.amount,
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: {
          redirectUrl: finalRedirectUrl,
        },
        paymentModeConfig,
      },
      metaInfo: {
        udf1: payload.merchantOrderId,
        udf2: "web_checkout",
      },
    };

    const response = await fetch(`${config.apiBaseUrl}/checkout/v2/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: JSON.stringify(createPaymentPayload),
    });

    const responseBodyText = await response.text();
    let createPaymentResponse: PhonePeCreatePaymentResponse | null = null;
    try {
      createPaymentResponse = JSON.parse(responseBodyText) as PhonePeCreatePaymentResponse;
    } catch {
      // No-op: handled below with response text.
    }

    if (!response.ok) {
      throw new Error(
        createPaymentResponse?.message ||
          `PhonePe create payment failed with status ${response.status}: ${responseBodyText}`
      );
    }

    if (!createPaymentResponse?.data?.redirectUrl) {
      throw new Error(createPaymentResponse?.message || "PhonePe did not return redirectUrl.");
    }

    return new Response(JSON.stringify(createPaymentResponse.data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("phonepe-create-payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to initiate PhonePe payment.";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
