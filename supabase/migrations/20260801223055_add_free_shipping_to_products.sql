-- Per-product shipping override. When every item in a cart is marked
-- free_shipping the order ships free regardless of the store threshold;
-- a mixed cart falls back to the normal store shipping rules.
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN NOT NULL DEFAULT false;
