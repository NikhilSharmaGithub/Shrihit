import { corsHeaders } from "../_shared/cors.ts";
import { getRazorpayAuthHeader, getRazorpayConfig } from "../_shared/razorpay.ts";

interface CreateOrderRequest {
  amount: number; // in paise
  receipt: string;
}

const validateRequest = ({ amount, receipt }: CreateOrderRequest) => {
  if (!receipt || typeof receipt !== "string") {
    throw new Error("receipt is required.");
  }

  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error("amount must be an integer in paise and at least 100.");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CreateOrderRequest;
    validateRequest(payload);

    const config = getRazorpayConfig();

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(config),
      },
      body: JSON.stringify({
        amount: payload.amount,
        currency: "INR",
        receipt: payload.receipt,
      }),
    });

    const responseBodyText = await response.text();
    let razorpayResponse: { id?: string; amount?: number; currency?: string; error?: { description?: string } } | null =
      null;
    try {
      razorpayResponse = JSON.parse(responseBodyText);
    } catch {
      // No-op: handled below with response text.
    }

    if (!response.ok) {
      throw new Error(
        razorpayResponse?.error?.description || `Razorpay create order failed with status ${response.status}: ${responseBodyText}`
      );
    }

    if (!razorpayResponse?.id) {
      throw new Error("Razorpay did not return an order id.");
    }

    return new Response(
      JSON.stringify({
        order_id: razorpayResponse.id,
        amount: razorpayResponse.amount,
        currency: razorpayResponse.currency,
        key_id: config.keyId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("razorpay-create-order error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create Razorpay order.";
    const status = errorMessage.includes("credentials") ? 401 : 400;

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
