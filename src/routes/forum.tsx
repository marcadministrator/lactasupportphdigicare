import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Heart } from "lucide-react";
import { loadList, saveList } from "@/lib/storage";

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

type Post = { id: string; name: string; body: string; ts: number; role?: "counselor" };
const KEY = "lacta.forum.v1";

const SEED: Post[] = [
  {
    id: "seed-1",
    name: "Nurse Rina",
    role: "counselor",
    body: "Reminder mga mommies: uminom ng 8+ basong tubig kada araw. Kung masakit ang suso, mag-warm compress bago magpasuso. 💛",
    ts: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "seed-2",
    name: "Ate Mia",
    body: "Salamat sa mga tips! Sa wakas, nakakapagpasuso na ako ng maayos sa aking 2-week old.",
    ts: Date.now() - 1000 * 60 * 60 * 24,
  },
];

function ForumPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const existing = loadList<Post>(KEY);
    if (existing.length === 0) {
      saveList(KEY, SEED);
      setPosts(SEED);
    } else {
      setPosts(existing);
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const p: Post = {
      id: crypto.randomUUID(),
      name: name.trim() || "Anonymous",
      body: body.trim(),
      ts: Date.now(),
    };
    const next = [p, ...posts];
    setPosts(next);
    saveList(KEY, next);
    setBody("");
  }

  return (
    <AppShell title="Open Forum" subtitle="Ligtas na peer support space">
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
        <Button type="submit" className="w-full">
          Post
        </Button>
      </form>

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
                    {new Date(p.ts).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </span>
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