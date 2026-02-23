import { corsHeaders } from "../_shared/cors.ts";
import { getPhonePeAuthorizationHeader, getPhonePeConfig } from "../_shared/phonepe.ts";
import { getRuntimeStoreSettings, normalizePhonePeMode } from "../_shared/store-settings.ts";

interface OrderStatusRequest {
  merchantOrderId: string;
  details?: boolean;
  phonepeMode?: string;
}

interface PhonePeOrderStatusData {
  orderId?: string;
  state?: string;
  amount?: number;
  paymentDetails?: unknown[];
}

interface PhonePeOrderStatusResponse {
  success?: boolean;
  code?: string;
  message?: string;
  data?: PhonePeOrderStatusData;
}

const validateRequest = ({ merchantOrderId }: OrderStatusRequest) => {
  if (!merchantOrderId) {
    throw new Error("merchantOrderId is required.");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as OrderStatusRequest;
    validateRequest(payload);

    const runtimeSettings = await getRuntimeStoreSettings();
    const requestedMode = normalizePhonePeMode(payload.phonepeMode, runtimeSettings.phonepeMode);

    const config = getPhonePeConfig(requestedMode);
    const authorizationHeader = await getPhonePeAuthorizationHeader(config);
    const detailsQuery = payload.details ? "true" : "false";

    const response = await fetch(
      `${config.apiBaseUrl}/checkout/v2/order/${encodeURIComponent(payload.merchantOrderId)}/status?details=${detailsQuery}`,
      {
        method: "GET",
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );

    const responseBodyText = await response.text();
    let orderStatusResponse: PhonePeOrderStatusResponse | null = null;
    try {
      orderStatusResponse = JSON.parse(responseBodyText) as PhonePeOrderStatusResponse;
    } catch {
      // No-op: handled with fallback response text.
    }

    if (!response.ok) {
      throw new Error(
        orderStatusResponse?.message ||
          `PhonePe order status failed with status ${response.status}: ${responseBodyText}`
      );
    }

    if (!orderStatusResponse?.data?.state) {
      throw new Error(orderStatusResponse?.message || "PhonePe order status did not include state.");
    }

    return new Response(JSON.stringify(orderStatusResponse.data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("phonepe-order-status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch PhonePe order status.";

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
