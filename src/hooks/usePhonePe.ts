import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhonePeCheckoutFlow, PhonePeMode } from "@/lib/store-settings";

type PhonePeCheckoutCallbackResponse = "USER_CANCEL" | "CONCLUDED";

interface PhonePeCheckoutOptions {
  tokenUrl: string;
  callback?: (response: PhonePeCheckoutCallbackResponse) => void;
  type?: "IFRAME";
}

interface PhonePeCheckout {
  transact: (options: PhonePeCheckoutOptions) => void;
  closePage: () => void;
}

interface PhonePeCreatePaymentResponse {
  orderId: string;
  redirectUrl: string;
  state: string;
  expiryAt?: number;
}

interface PhonePeOrderStatusResponse {
  orderId: string;
  state: string;
}

interface InitiatePhonePePaymentOptions {
  merchantOrderId: string;
  amount: number; // in paise
  redirectUrl: string;
  phonepeMode?: PhonePeMode;
  checkoutFlowType?: PhonePeCheckoutFlow;
  checkoutScriptUrl?: string;
  onSuccess: (response: PhonePeOrderStatusResponse) => Promise<void> | void;
  onFailure: (error: Error) => void;
}

interface UsePhonePeReturn {
  isLoading: boolean;
  isPhonePeReady: boolean;
  initiatePayment: (options: InitiatePhonePePaymentOptions) => Promise<void>;
}

declare global {
  interface Window {
    PhonePeCheckout?: PhonePeCheckout;
  }
}

const getFallbackPaymentScriptUrl = () =>
  import.meta.env.VITE_PHONEPE_CHECKOUT_SCRIPT_URL || "https://mercury-stg.phonepe.com/web/bundle/checkout.js";

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error("PhonePe payment failed. Please try again.");
};

export const usePhonePe = (): UsePhonePeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPhonePeReady, setIsPhonePeReady] = useState(false);

  const loadPhonePeScript = useCallback((scriptUrl?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.PhonePeCheckout?.transact) {
        setIsPhonePeReady(true);
        resolve(true);
        return;
      }

      const finalScriptUrl = scriptUrl?.trim() || getFallbackPaymentScriptUrl();
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${finalScriptUrl}"]`);
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsPhonePeReady(true);
          resolve(true);
        });
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = finalScriptUrl;
      script.async = true;
      script.onload = () => {
        setIsPhonePeReady(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load PhonePe checkout script");
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(
    async ({
      merchantOrderId,
      amount,
      redirectUrl,
      phonepeMode,
      checkoutFlowType = "IFRAME",
      checkoutScriptUrl,
      onSuccess,
      onFailure,
    }: InitiatePhonePePaymentOptions) => {
      setIsLoading(true);

      try {
        const scriptLoaded = await loadPhonePeScript(checkoutScriptUrl);
        if (!scriptLoaded) {
          throw new Error("Unable to load PhonePe checkout. Please refresh and try again.");
        }

        const { data: createPaymentData, error: createPaymentError } =
          await supabase.functions.invoke<PhonePeCreatePaymentResponse>("phonepe-create-payment", {
            body: {
              merchantOrderId,
              amount,
              redirectUrl,
              phonepeMode,
            },
          });

        if (createPaymentError) {
          throw new Error(createPaymentError.message || "Failed to initiate PhonePe payment.");
        }

        if (!createPaymentData?.redirectUrl) {
          throw new Error("PhonePe did not return a checkout URL.");
        }

        if (!window.PhonePeCheckout?.transact) {
          throw new Error("PhonePe checkout is unavailable. Please try again.");
        }

        if (checkoutFlowType === "REDIRECT") {
          window.PhonePeCheckout.transact({
            tokenUrl: createPaymentData.redirectUrl,
          });
          return;
        }

        const paymentResult = await new Promise<PhonePeCheckoutCallbackResponse>((resolve) => {
          window.PhonePeCheckout?.transact({
            tokenUrl: createPaymentData.redirectUrl,
            type: "IFRAME",
            callback: (response) => resolve(response),
          });
        });

        if (paymentResult === "USER_CANCEL") {
          throw new Error("Payment was cancelled.");
        }

        const { data: orderStatusData, error: orderStatusError } =
          await supabase.functions.invoke<PhonePeOrderStatusResponse>("phonepe-order-status", {
            body: {
              merchantOrderId,
              details: false,
              phonepeMode,
            },
          });

        if (orderStatusError) {
          throw new Error(orderStatusError.message || "Unable to verify payment status.");
        }

        if (!orderStatusData) {
          throw new Error("PhonePe status response is empty.");
        }

        if (orderStatusData.state !== "COMPLETED") {
          throw new Error(`Payment ${orderStatusData.state.toLowerCase()}.`);
        }

        await onSuccess(orderStatusData);
      } catch (error) {
        onFailure(normalizeError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [loadPhonePeScript]
  );

  return {
    isLoading,
    isPhonePeReady,
    initiatePayment,
  };
};
