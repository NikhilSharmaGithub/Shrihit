-- ---------------------------------------------------------------------------
-- Product reviews
--
-- The product page previously showed a hardcoded "4.8 (127 reviews)" on every
-- product. These are the real thing: one review per customer per product, and
-- verified_purchase is derived from the customer's own paid orders rather than
-- being something the client can claim.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Customer',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT reviews_one_per_user_per_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews (product_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can write their own review" ON public.reviews;
CREATE POLICY "Users can write their own review"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own review" ON public.reviews;
CREATE POLICY "Users can update their own review"
ON public.reviews FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own review" ON public.reviews;
CREATE POLICY "Users can delete their own review"
ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews"
ON public.reviews FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stamp verified_purchase from the reviewer's own paid orders. Done in a
-- trigger so the client cannot mark its own review as verified.
CREATE OR REPLACE FUNCTION public.set_review_verified_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.verified_purchase := EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = NEW.product_id
      AND o.user_id = NEW.user_id
      AND o.payment_status = 'paid'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_set_verified ON public.reviews;
CREATE TRIGGER reviews_set_verified
BEFORE INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_review_verified_purchase();

-- Aggregate ratings without exposing every row to the product listing.
CREATE OR REPLACE VIEW public.product_rating_summary AS
SELECT
  product_id,
  ROUND(AVG(rating)::numeric, 1) AS average_rating,
  COUNT(*)::int AS review_count
FROM public.reviews
GROUP BY product_id;

-- ---------------------------------------------------------------------------
-- Coupons
--
-- The coupon table itself is never exposed to the storefront: a customer must
-- not be able to list every code. Validation goes through validate_coupon(),
-- and the real discount is recomputed server-side at payment time.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;

-- Returns the discount for a code against a given subtotal, or an error
-- reason. Kept SECURITY DEFINER so the storefront can check a code it was
-- given without being able to read the coupons table.
CREATE OR REPLACE FUNCTION public.validate_coupon(_code TEXT, _subtotal NUMERIC)
RETURNS TABLE (valid BOOLEAN, discount NUMERIC, reason TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  c public.coupons%ROWTYPE;
  _discount NUMERIC;
BEGIN
  SELECT * INTO c FROM public.coupons
  WHERE upper(code) = upper(trim(_code));

  IF NOT FOUND OR NOT c.is_active THEN
    RETURN QUERY SELECT false, 0::numeric, 'This coupon code is not valid.';
    RETURN;
  END IF;

  IF now() < c.valid_from THEN
    RETURN QUERY SELECT false, 0::numeric, 'This coupon is not active yet.';
    RETURN;
  END IF;

  IF c.valid_until IS NOT NULL AND now() > c.valid_until THEN
    RETURN QUERY SELECT false, 0::numeric, 'This coupon has expired.';
    RETURN;
  END IF;

  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN
    RETURN QUERY SELECT false, 0::numeric, 'This coupon has already been fully used.';
    RETURN;
  END IF;

  IF _subtotal < c.min_order_amount THEN
    RETURN QUERY SELECT false, 0::numeric,
      format('Add items worth Rs%s to use this coupon.', ROUND(c.min_order_amount - _subtotal));
    RETURN;
  END IF;

  IF c.discount_type = 'percent' THEN
    _discount := _subtotal * (c.discount_value / 100.0);
  ELSE
    _discount := c.discount_value;
  END IF;

  IF c.max_discount_amount IS NOT NULL THEN
    _discount := LEAST(_discount, c.max_discount_amount);
  END IF;

  -- Never let a discount exceed the order itself.
  _discount := LEAST(_discount, _subtotal);

  RETURN QUERY SELECT true, ROUND(_discount, 2), NULL::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, NUMERIC) TO anon, authenticated;

-- Counts a coupon as used once its order is actually paid.
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL
     AND NEW.payment_status = 'paid'
     AND OLD.payment_status IS DISTINCT FROM 'paid' THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE upper(code) = upper(NEW.coupon_code);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_coupon_usage ON public.orders;
CREATE TRIGGER orders_coupon_usage
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_usage();
