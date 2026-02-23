CREATE TABLE IF NOT EXISTS public.store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Shrihit',
  tagline TEXT NOT NULL DEFAULT 'Sacred Craftsmanship for Divine Moments',
  email TEXT NOT NULL DEFAULT 'contact@shrihit.in',
  phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  address TEXT NOT NULL DEFAULT 'Moradabad, Uttar Pradesh, India',
  whatsapp_number TEXT NOT NULL DEFAULT '+919876543210',
  free_shipping_threshold NUMERIC NOT NULL DEFAULT 999,
  shipping_cost NUMERIC NOT NULL DEFAULT 99,
  cod_enabled BOOLEAN NOT NULL DEFAULT true,
  phonepe_enabled BOOLEAN NOT NULL DEFAULT true,
  phonepe_mode TEXT NOT NULL DEFAULT 'sandbox',
  phonepe_checkout_flow TEXT NOT NULL DEFAULT 'IFRAME',
  phonepe_checkout_script_url TEXT NOT NULL DEFAULT 'https://mercury-stg.phonepe.com/web/bundle/checkout.js',
  phonepe_enabled_payment_modes TEXT[] NOT NULL DEFAULT ARRAY['UPI_INTENT', 'UPI_COLLECT', 'UPI_QR'],
  phonepe_disable_payment_retry BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_singleton CHECK (id = 1),
  CONSTRAINT store_settings_phonepe_mode_check CHECK (phonepe_mode IN ('sandbox', 'production')),
  CONSTRAINT store_settings_phonepe_checkout_flow_check CHECK (phonepe_checkout_flow IN ('IFRAME', 'REDIRECT'))
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view store settings"
ON public.store_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert store settings"
ON public.store_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update store settings"
ON public.store_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.store_settings (
  id,
  store_name,
  tagline,
  email,
  phone,
  address,
  whatsapp_number
)
VALUES (
  1,
  'Shrihit',
  'Sacred Craftsmanship for Divine Moments',
  'contact@shrihit.in',
  '+91 98765 43210',
  'Moradabad, Uttar Pradesh, India',
  '+919876543210'
)
ON CONFLICT (id) DO NOTHING;
