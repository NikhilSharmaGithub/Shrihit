-- Footer social icons previously all pointed at href="#". They are now driven
-- by these settings, and any link left blank is simply not rendered.
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS instagram_url TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS facebook_url  TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS twitter_url   TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS youtube_url   TEXT NOT NULL DEFAULT '';
