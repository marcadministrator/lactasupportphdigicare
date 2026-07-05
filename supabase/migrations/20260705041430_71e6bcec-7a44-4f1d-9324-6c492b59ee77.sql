
-- 1) Remove the founding-admin trigger + function
DROP TRIGGER IF EXISTS grant_admin_for_founder_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_admin ON auth.users;
DROP FUNCTION IF EXISTS public.grant_admin_for_founder() CASCADE;

-- 2) Remove the founding admin account and any role rows tied to it
DELETE FROM public.user_roles
 WHERE user_id IN (SELECT id FROM auth.users WHERE lower(email) = 'administrator@lactasupport.ph');
DELETE FROM auth.users WHERE lower(email) = 'administrator@lactasupport.ph';

-- 3) Add slug column so built-in guides can be upserted and edited
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS guides_slug_key ON public.guides (slug) WHERE slug IS NOT NULL;
