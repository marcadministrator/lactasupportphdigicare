DROP POLICY IF EXISTS "Client can delete own posts" ON public.forum_posts;

CREATE OR REPLACE FUNCTION public.delete_forum_post(post_id uuid, caller_client_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner text;
BEGIN
  SELECT client_id INTO owner FROM public.forum_posts WHERE id = post_id;
  IF owner IS NULL OR owner <> caller_client_id THEN
    RETURN false;
  END IF;
  DELETE FROM public.forum_posts WHERE id = post_id AND client_id = caller_client_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_forum_post(uuid, text) TO anon, authenticated;