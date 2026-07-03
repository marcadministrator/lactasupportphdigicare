CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Anonymous',
  body TEXT NOT NULL,
  role TEXT,
  client_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.forum_posts TO anon;
GRANT SELECT, INSERT, DELETE ON public.forum_posts TO authenticated;
GRANT ALL ON public.forum_posts TO service_role;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON public.forum_posts FOR INSERT WITH CHECK (
  length(body) BETWEEN 1 AND 2000 AND length(name) BETWEEN 1 AND 60
);
CREATE POLICY "Client can delete own posts" ON public.forum_posts FOR DELETE USING (
  client_id IS NOT NULL AND client_id = current_setting('request.headers', true)::json->>'x-client-id'
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER TABLE public.forum_posts REPLICA IDENTITY FULL;