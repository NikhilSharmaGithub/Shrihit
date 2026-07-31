-- The previous trigger fired AFTER INSERT on orders, but the app inserts the
-- order row and its line items as two separate statements, so the trigger ran
-- while the order still had no items and decremented nothing.
--
-- Line items are always written after the order, so hang the COD path off
-- order_items instead. The payment path stays on orders, for online orders
-- whose items were inserted while the payment was still pending.

DROP TRIGGER IF EXISTS orders_stock_on_insert ON public.orders;

-- Decrement stock for a single line item.
CREATE OR REPLACE FUNCTION public.handle_order_item_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _payment_method TEXT;
  _payment_status TEXT;
BEGIN
  SELECT payment_method, payment_status
  INTO _payment_method, _payment_status
  FROM public.orders
  WHERE id = NEW.order_id;

  -- COD reserves stock at order time; online orders reserve it once paid
  -- (handled by the orders update trigger below).
  IF _payment_method = 'cod' OR _payment_status = 'paid' THEN
    UPDATE public.products
    SET
      stock_qty = GREATEST(0, stock_qty - NEW.quantity),
      in_stock = CASE WHEN GREATEST(0, stock_qty - NEW.quantity) = 0 THEN false ELSE in_stock END
    WHERE id = NEW.product_id
      AND stock_qty > 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_items_stock_on_insert ON public.order_items;
CREATE TRIGGER order_items_stock_on_insert
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.handle_order_item_stock();
