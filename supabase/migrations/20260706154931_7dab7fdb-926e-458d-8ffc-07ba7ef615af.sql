
UPDATE auth.users
SET encrypted_password = crypt('administrator@lactasupport.ph', gen_salt('bf')),
    updated_at = now()
WHERE email = 'administrator@lactasupport.ph';
