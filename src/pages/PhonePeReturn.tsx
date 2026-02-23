import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateOrderData, useCreateOrder } from "@/hooks/useOrders";
import { useCart } from "@/contexts/CartContext";
import { getPhonePePendingOrderStorageKey } from "@/lib/phonepe";
import { PhonePeMode } from "@/lib/store-settings";

type PaymentVerificationState = "loading" | "failed" | "error";

interface PhonePeOrderStatusResponse {
  orderId: string;
  state: string;
}

interface PendingPhonePeOrderPayload {
  orderData: CreateOrderData;
  phonepeMode: PhonePeMode;
}

const PhonePeReturn = () => {
  const [searchParams] = useSearchParams();
  const [verificationState, setVerificationState] = useState<PaymentVerificationState>("loading");
  const [statusMessage, setStatusMessage] = useState("Verifying your payment...");

  const hasProcessedRef = useRef(false);
  const createOrder = useCreateOrder();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const merchantOrderId = searchParams.get("merchantOrderId");
    if (!merchantOrderId) {
      setVerificationState("error");
      setStatusMessage("Missing PhonePe order reference. Please retry payment.");
      return;
    }

    const pendingOrderStorageKey = getPhonePePendingOrderStorageKey(merchantOrderId);
    const pendingOrderRaw = localStorage.getItem(pendingOrderStorageKey);

    if (!pendingOrderRaw) {
      setVerificationState("error");
      setStatusMessage(
        "We could not find your pending order data. If payment was debited, contact support with your order ID."
      );
      return;
    }

    let pendingOrder: PendingPhonePeOrderPayload;
    try {
      const parsedPayload = JSON.parse(pendingOrderRaw) as CreateOrderData | PendingPhonePeOrderPayload;

      if ("orderData" in parsedPayload && "phonepeMode" in parsedPayload) {
        pendingOrder = parsedPayload;
      } else {
        pendingOrder = {
          orderData: parsedPayload as CreateOrderData,
          phonepeMode: "sandbox",
        };
      }
    } catch (error) {
      console.error("Failed to parse pending PhonePe order:", error);
      setVerificationState("error");
      setStatusMessage("Order data is invalid. Please contact support.");
      return;
    }

    const verifyAndCompleteOrder = async () => {
      try {
        const { data, error } = await supabase.functions.invoke<PhonePeOrderStatusResponse>("phonepe-order-status", {
          body: {
            merchantOrderId,
            details: false,
            phonepeMode: pendingOrder.phonepeMode,
          },
        });

        if (error) {
          throw new Error(error.message || "Unable to verify payment status.");
        }

        if (!data?.state) {
          throw new Error("PhonePe status response was empty.");
        }

        if (data.state !== "COMPLETED") {
          setVerificationState("failed");
          setStatusMessage(`Payment ${data.state.toLowerCase()}. Please try again.`);
          return;
        }

        await createOrder.mutateAsync({
          ...pendingOrder.orderData,
          payment_method: "phonepe",
          payment_status: "paid",
        });

        localStorage.removeItem(pendingOrderStorageKey);
        clearCart();

        toast({
          title: "Payment Successful",
          description: "Your order has been placed successfully.",
        });

        navigate("/order-success", { replace: true });
      } catch (error) {
        console.error("PhonePe return processing failed:", error);
        setVerificationState("error");
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to complete your order after payment."
        );
      }
    };

    verifyAndCompleteOrder();
  }, [searchParams, createOrder, clearCart, toast, navigate]);

  if (verificationState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-xl p-8 shadow-sacred text-center max-w-md w-full">
          <Loader2 size={36} className="animate-spin mx-auto text-primary mb-4" />
          <h1 className="font-display text-2xl text-foreground mb-2">Checking Payment</h1>
          <p className="text-muted-foreground">{statusMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-xl p-8 shadow-sacred text-center max-w-md w-full">
        <AlertTriangle size={42} className="mx-auto text-destructive mb-4" />
        <h1 className="font-display text-2xl text-foreground mb-2">Payment Not Completed</h1>
        <p className="text-muted-foreground mb-6">{statusMessage}</p>
        <Link to="/checkout">
          <Button variant="sacred" className="w-full">
            Retry Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PhonePeReturn;
