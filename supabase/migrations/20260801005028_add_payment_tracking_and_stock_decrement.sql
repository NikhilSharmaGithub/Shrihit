-- Store Razorpay payment identifiers so payments can be reconciled and refunded.
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id
ON public.orders (razorpay_payment_id);

-- Customers must be able to mark their own order paid once the edge function
-- has verified the Razorpay signature. Admins already have a broader policy.
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Decrement product stock exactly once per order, when the order actually
-- becomes payable stock: immediately for COD, on payment for online orders.
CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products AS p
  SET
    stock_qty = GREATEST(0, p.stock_qty - oi.quantity),
    in_stock = CASE WHEN GREATEST(0, p.stock_qty - oi.quantity) = 0 THEN false ELSE p.in_stock END
  FROM public.order_items AS oi
  WHERE oi.order_id = _order_id
    AND oi.product_id = p.id
    AND p.stock_qty > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_order_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- COD orders reserve stock as soon as they are placed.
  IF TG_OP = 'INSERT' AND NEW.payment_method = 'cod' THEN
    PERFORM public.decrement_stock_for_order(NEW.id);
  END IF;

  -- Online orders reserve stock only once payment is confirmed.
  IF TG_OP = 'UPDATE'
     AND NEW.payment_status = 'paid'
     AND OLD.payment_status IS DISTINCT FROM 'paid' THEN
    PERFORM public.decrement_stock_for_order(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_stock_on_insert ON public.orders;
CREATE TRIGGER orders_stock_on_insert
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_stock();

DROP TRIGGER IF EXISTS orders_stock_on_payment ON public.orders;
CREATE TRIGGER orders_stock_on_payment
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_stock();
