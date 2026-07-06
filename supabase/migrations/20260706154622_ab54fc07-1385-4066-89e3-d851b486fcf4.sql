
-- 1. Inquiries table
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.store_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  customer_name text NOT NULL,
  contact text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT INSERT ON public.inquiries TO anon;
GRANT ALL ON public.inquiries TO service_role;

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit inquiries"
ON public.inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(customer_name) BETWEEN 1 AND 120
  AND length(contact) BETWEEN 3 AND 200
  AND length(message) BETWEEN 1 AND 4000
  AND length(product_name) BETWEEN 1 AND 200
);

CREATE POLICY "Admins read inquiries"
ON public.inquiries FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update inquiries"
ON public.inquiries FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete inquiries"
ON public.inquiries FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER inquiries_touch_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. Seed admin account: administrator@lactasupport.ph / user
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'administrator@lactasupport.ph';

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      'administrator@lactasupport.ph',
      crypt('user', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Administrator"}'::jsonb,
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'administrator@lactasupport.ph', 'email_verified', true),
      'email',
      admin_id::text,
      now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('user', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = admin_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
