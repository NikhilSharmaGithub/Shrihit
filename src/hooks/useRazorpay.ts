import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface UseRazorpayReturn {
  isLoading: boolean;
  isRazorpayReady: boolean;
  initiatePayment: (options: PaymentOptions) => Promise<void>;
}

interface PaymentOptions {
  amount: number; // In rupees
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayResponse) => void;
  onFailure: (error: Error) => void;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const { toast } = useToast();

  // Load Razorpay script dynamically
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setIsRazorpayReady(true);
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setIsRazorpayReady(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(
    async ({
      amount,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      onSuccess,
      onFailure,
    }: PaymentOptions) => {
      setIsLoading(true);

      try {
        // Load Razorpay script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error("Failed to load payment gateway");
        }

        // In production, you would create an order via edge function
        // For now, we'll show a placeholder since keys aren't configured
        const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!razorpayKeyId) {
          toast({
            title: "Payment Gateway Not Configured",
            description: "Razorpay integration is ready but API keys need to be configured. Please contact admin.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const options: RazorpayOptions = {
          key: razorpayKeyId,
          amount: amount * 100, // Razorpay expects paise
          currency: "INR",
          name: "श्रीहित SHRIHIT",
          description: "Pooja Items Purchase",
          order_id: orderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: "#C17F24", // Primary gold color
          },
          handler: (response) => {
            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been placed successfully.",
            });
            onSuccess(response);
          },
          modal: {
            ondismiss: () => {
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment. Your order is not placed.",
              });
              setIsLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        console.error("Payment error:", error);
        onFailure(error as Error);
        toast({
          title: "Payment Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadRazorpayScript, toast]
  );

  return {
    isLoading,
    isRazorpayReady,
    initiatePayment,
  };
};
