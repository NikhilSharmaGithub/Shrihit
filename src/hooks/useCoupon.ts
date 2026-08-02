import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppliedCoupon {
  code: string;
  discount: number;
}

interface UseCouponReturn {
  applied: AppliedCoupon | null;
  isChecking: boolean;
  error: string | null;
  apply: (code: string, subtotal: number) => Promise<void>;
  clear: () => void;
}

/**
 * Checks a code through validate_coupon(), which is SECURITY DEFINER so the
 * storefront never gets read access to the coupons table itself. The discount
 * returned here is only for display -- razorpay-create-order recomputes it
 * before charging.
 */
export const useCoupon = (): UseCouponReturn => {
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async (code: string, subtotal: number) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a coupon code.");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("validate_coupon", {
        _code: trimmed,
        _subtotal: subtotal,
      });

      if (rpcError) throw rpcError;

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.valid) {
        setApplied(null);
        setError(result?.reason || "This coupon code is not valid.");
        return;
      }

      setApplied({ code: trimmed.toUpperCase(), discount: Number(result.discount) });
    } catch (err) {
      setApplied(null);
      setError(err instanceof Error ? err.message : "Could not check that coupon.");
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clear = useCallback(() => {
    setApplied(null);
    setError(null);
  }, []);

  return { applied, isChecking, error, apply, clear };
};
