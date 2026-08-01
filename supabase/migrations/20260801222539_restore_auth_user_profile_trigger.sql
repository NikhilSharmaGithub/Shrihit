-- The initial migration was a pg_dump of the public schema, so the trigger that
-- lives on auth.users was never carried over to this project. handle_new_user()
-- existed but nothing invoked it, so signups created no profile row -- which in
-- turn broke promote_to_admin(), since it resolves the target user by profile
-- email.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for accounts created while the trigger was missing.
-- Anonymous guest-checkout users are skipped; they have no email and never
-- needed a profile.
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'customer')
FROM auth.users AS u
WHERE u.email IS NOT NULL
  AND u.email <> ''
ON CONFLICT (id) DO NOTHING;
