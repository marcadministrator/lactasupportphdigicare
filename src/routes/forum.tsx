import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Heart, Trash2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loadObject, PROFILE_KEY } from "@/lib/storage";
import { getClientId } from "@/lib/client-id";

export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      { title: "Forum — LactaSupport PH" },
      {
        name: "description",
        content: "Data-light community message board moderated by health workers.",
      },
    ],
  }),
  component: ForumPage,
});

type Post = {
  id: string;
  name: string;
  body: string;
  role: string | null;
  client_id: string | null;
  created_at: string;
};

function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [online, setOnline] = useState(true);
  const clientId = typeof window !== "undefined" ? getClientId() : "";

  useEffect(() => {
    const profile = loadObject<{ name?: string }>(PROFILE_KEY, {});
    if (profile.name) setName(profile.name);
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!cancelled) {
        if (error) toast.error("Couldn't load posts");
        else setPosts((data ?? []) as Post[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("forum_posts_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "forum_posts" },
        (payload) => {
          setPosts((prev) => {
            const p = payload.new as Post;
            if (prev.some((x) => x.id === p.id)) return prev;
            return [p, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "forum_posts" },
        (payload) => {
          const oldId = (payload.old as { id?: string }).id;
          if (oldId) setPosts((prev) => prev.filter((x) => x.id !== oldId));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      supabase.removeChannel(channel);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("forum_posts").insert({
      name: (name.trim() || "Anonymous").slice(0, 60),
      body: body.trim().slice(0, 2000),
      client_id: clientId,
    });
    setPosting(false);
    if (error) {
      toast.error("Couldn't post — check your connection");
      return;
    }
    setBody("");
    toast.success("Posted");
  }

  async function remove(id: string, ownClientId: string | null) {
    if (ownClientId !== clientId) {
      toast.error("You can only delete your own posts");
      return;
    }
    const { data, error } = await supabase.rpc("delete_forum_post", {
      post_id: id,
      caller_client_id: clientId,
    });
    if (error || data === false) toast.error("Couldn't delete");
  }

  return (
    <AppShell title="Open Forum" subtitle="Ligtas na peer support space">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80 border border-border/60">
        {online ? (
          <><Wifi className="h-3.5 w-3.5" aria-hidden /> Live — posts sync worldwide</>
        ) : (
          <><WifiOff className="h-3.5 w-3.5" aria-hidden /> Offline — posting needs internet</>
        )}
      </div>
      <Card className="border-secondary/60 bg-secondary/30">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-secondary-foreground" aria-hidden />
          <p className="text-xs text-secondary-foreground">
            Moderated by health workers &amp; lactation counselors. Please be kind. Huwag magpost
            ng personal na impormasyon.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4">
        <div>
          <Label htmlFor="name" className="text-xs">
            Palayaw (optional)
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" />
        </div>
        <div>
          <Label htmlFor="body" className="text-xs">
            Mensahe
          </Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ibahagi ang tanong o karanasan mo..."
            rows={3}
          />
        </div>
        <Button type="submit" className="w-full" disabled={posting || !online}>
          {posting ? "Posting…" : "Post"}
        </Button>
      </form>

      {loading ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>
      ) : null}

      <ul className="mt-5 space-y-3">
        {posts.map((p) => (
          <li key={p.id}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  {p.role === "counselor" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Heart className="h-3 w-3" aria-hidden /> Counselor
                    </span>
                  ) : null}
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {new Date(p.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  {p.client_id === clientId ? (
                  <button
                    type="button"
                    onClick={() => remove(p.id, p.client_id)}
                    aria-label="Delete post"
                    className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-foreground/85">{p.body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}