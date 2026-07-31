import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RAZORPAY_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayCreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckout {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

interface InitiateRazorpayPaymentOptions {
  /** Order number of an existing pending order; the server derives the amount from it. */
  receipt: string;
  name: string;
  email: string;
  contact: string;
  onSuccess: (response: RazorpaySuccessResponse) => Promise<void> | void;
  onFailure: (error: Error) => void;
  onDismiss?: () => void;
}

interface UseRazorpayReturn {
  isLoading: boolean;
  initiatePayment: (options: InitiateRazorpayPaymentOptions) => Promise<void>;
}

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Razorpay payment failed. Please try again.");
};

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_CHECKOUT_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay checkout script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const initiatePayment = useCallback(async (options: InitiateRazorpayPaymentOptions) => {
    setIsLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout. Please refresh and try again.");
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke<RazorpayCreateOrderResponse>(
        "razorpay-create-order",
        { body: { receipt: options.receipt } }
      );

      if (orderError) {
        throw new Error(orderError.message || "Failed to initiate Razorpay payment.");
      }

      if (!orderData?.order_id) {
        throw new Error("Razorpay did not return an order id.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable. Please try again.");
      }

      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "Shrihit",
        description: `Order ${options.receipt}`,
        prefill: {
          name: options.name,
          email: options.email,
          contact: options.contact,
        },
        theme: { color: "#ca8a04" },
        handler: async (response) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke<{ verified: boolean }>(
              "razorpay-verify-payment",
              { body: response }
            );

            if (verifyError || !verifyData?.verified) {
              throw new Error(verifyError?.message || "Payment verification failed.");
            }

            await options.onSuccess(response);
          } catch (error) {
            options.onFailure(normalizeError(error));
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            options.onDismiss?.();
          },
        },
      });

      checkout.on("payment.failed", () => {
        setIsLoading(false);
        options.onFailure(new Error("Payment failed. Please try again."));
      });

      checkout.open();
    } catch (error) {
      setIsLoading(false);
      options.onFailure(normalizeError(error));
    }
  }, []);

  return {
    isLoading,
    initiatePayment,
  };
};
