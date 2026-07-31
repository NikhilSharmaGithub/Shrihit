import { corsHeaders } from "../_shared/cors.ts";
import { getRazorpayAuthHeader, getRazorpayConfig } from "../_shared/razorpay.ts";

interface CreateOrderRequest {
  receipt: string;
}

const validateRequest = ({ receipt }: CreateOrderRequest) => {
  if (!receipt || typeof receipt !== "string") {
    throw new Error("receipt is required.");
  }
};

/**
 * Resolves the amount to charge from the database rather than trusting the
 * client. The order row is the source of truth, and its line items are
 * re-priced against the products table so a tampered client cannot pay less
 * than the catalogue price.
 */
const resolveAmountInPaise = async (orderNumber: string): Promise<number> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Server is not configured to verify order amounts.");
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    Accept: "application/json",
  };

  const orderUrl = new URL(`${supabaseUrl}/rest/v1/orders`);
  orderUrl.searchParams.set("order_number", `eq.${orderNumber}`);
  orderUrl.searchParams.set("select", "id,shipping_cost,payment_status,order_items(product_id,quantity)");

  const orderResponse = await fetch(orderUrl.toString(), { headers });
  if (!orderResponse.ok) {
    throw new Error(`Could not load order ${orderNumber}.`);
  }

  const orders = (await orderResponse.json()) as Array<{
    id: string;
    shipping_cost: number;
    payment_status: string;
    order_items: Array<{ product_id: string; quantity: number }>;
  }>;

  const order = orders?.[0];
  if (!order) {
    throw new Error(`Order ${orderNumber} was not found.`);
  }

  if (order.payment_status === "paid") {
    throw new Error(`Order ${orderNumber} is already paid.`);
  }

  if (!order.order_items?.length) {
    throw new Error(`Order ${orderNumber} has no items.`);
  }

  const productIds = [...new Set(order.order_items.map((item) => item.product_id))];
  const productsUrl = new URL(`${supabaseUrl}/rest/v1/products`);
  productsUrl.searchParams.set("id", `in.(${productIds.join(",")})`);
  productsUrl.searchParams.set("select", "id,price");

  const productsResponse = await fetch(productsUrl.toString(), { headers });
  if (!productsResponse.ok) {
    throw new Error("Could not verify product pricing.");
  }

  const products = (await productsResponse.json()) as Array<{ id: string; price: number }>;
  const priceById = new Map(products.map((product) => [product.id, Number(product.price)]));

  let itemsTotal = 0;
  for (const item of order.order_items) {
    const price = priceById.get(item.product_id);
    if (price === undefined) {
      throw new Error("Order contains a product that no longer exists.");
    }
    itemsTotal += price * item.quantity;
  }

  const total = itemsTotal + Number(order.shipping_cost ?? 0);
  const amountInPaise = Math.round(total * 100);

  if (!Number.isInteger(amountInPaise) || amountInPaise < 100) {
    throw new Error("Resolved order amount is invalid.");
  }

  return amountInPaise;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as CreateOrderRequest;
    validateRequest(payload);

    const config = getRazorpayConfig();
    const amount = await resolveAmountInPaise(payload.receipt);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getRazorpayAuthHeader(config),
      },
      body: JSON.stringify({
        amount,
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
