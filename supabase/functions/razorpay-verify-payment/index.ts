import { corsHeaders } from "../_shared/cors.ts";
import { getRazorpayConfig, hmacSha256Hex } from "../_shared/razorpay.ts";

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const validateRequest = (payload: Partial<VerifyPaymentRequest>) => {
  if (!payload.razorpay_order_id || !payload.razorpay_payment_id || !payload.razorpay_signature) {
    throw new Error("razorpay_order_id, razorpay_payment_id and razorpay_signature are all required.");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as Partial<VerifyPaymentRequest>;
    validateRequest(payload);

    const config = getRazorpayConfig();

    const expectedSignature = await hmacSha256Hex(
      `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`,
      config.keySecret
    );

    const verified = expectedSignature === payload.razorpay_signature;

    if (!verified) {
      return new Response(JSON.stringify({ verified: false, error: "Signature mismatch." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ verified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("razorpay-verify-payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to verify Razorpay payment.";

    return new Response(JSON.stringify({ verified: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
