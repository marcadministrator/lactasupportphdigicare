import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, LogOut, Trash2, Pencil, Plus, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — LactaSupport PH" },
      { name: "description", content: "Administrator dashboard for LactaSupport PH." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Product = { id: string; name: string; price_cents: number; description: string | null; active: boolean; sort_order: number };
type Guide = { id: string; category: "breastfeeding" | "postpartum" | "recipes"; title: string; summary: string; body: string; sort_order: number };
type ForumPost = { id: string; name: string; body: string; created_at: string };

const TABS = ["products", "guides", "forum"] as const;
type Tab = (typeof TABS)[number];

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      setEmail(userData.user?.email ?? "");
      if (!uid) return setIsAdmin(false);
      const { data, error } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      if (error) {
        toast.error("Couldn't verify role");
        setIsAdmin(false);
      } else setIsAdmin(!!data);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return (
      <AppShell title="Admin" subtitle="Checking access…">
        <p className="mt-6 text-center text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell title="Admin" subtitle="Not authorized">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm">
            <p className="font-semibold text-destructive">Not an administrator</p>
            <p className="mt-1 text-foreground/80">
              Signed in as <span className="font-medium">{email}</span>. Only accounts granted the
              admin role can edit content. Contact the LactaSupport PH team to request access.
            </p>
            <Button variant="outline" className="mt-3 w-full" onClick={signOut}>
              <LogOut className="mr-1 h-4 w-4" aria-hidden /> Sign out
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin" subtitle="LactaSupport PH · Administrator account">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <div className="flex-1 text-xs text-foreground/85">
            <p className="font-semibold text-foreground">Administrator ✓</p>
            <p>{email}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl border px-2 py-2 text-xs font-medium capitalize ${
              tab === t ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "products" ? <ProductsPanel /> : tab === "guides" ? <GuidesPanel /> : <ForumPanel />}
      </div>
    </AppShell>
  );
}

function ProductsPanel() {
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  async function load() {
    const { data, error } = await supabase.from("store_products").select("*").order("sort_order");
    if (error) return toast.error("Load failed");
    setItems((data ?? []) as Product[]);
  }
  useEffect(() => { load(); }, []);

  async function save(p: Partial<Product>) {
    const payload = {
      name: p.name?.trim() ?? "",
      price_cents: Math.round(Number(p.price_cents ?? 0)),
      description: p.description ?? null,
      active: p.active ?? true,
      sort_order: Number(p.sort_order ?? 0),
    };
    if (!payload.name || payload.price_cents < 0) return toast.error("Fill name and price");
    if (p.id) {
      const { error } = await supabase.from("store_products").update(payload).eq("id", p.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("store_products").insert(payload);
      if (error) return toast.error(error.message);
    }
    setEditing(null);
    toast.success("Saved");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("store_products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <div className="space-y-3">
      {editing ? (
        <ProductForm value={editing} onCancel={() => setEditing(null)} onSave={save} />
      ) : (
        <Button className="w-full" onClick={() => setEditing({ active: true, sort_order: items.length + 1 })}>
          <Plus className="mr-1 h-4 w-4" aria-hidden /> Add product
        </Button>
      )}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-primary">₱{(p.price_cents / 100).toLocaleString()}</p>
                    {p.description ? <p className="mt-1 text-xs text-muted-foreground">{p.description}</p> : null}
                    {!p.active ? <span className="mt-1 inline-block text-[10px] uppercase text-muted-foreground">Hidden</span> : null}
                  </div>
                  <button onClick={() => setEditing(p)} aria-label="Edit" className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} aria-label="Delete" className="rounded-lg p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductForm({ value, onCancel, onSave }: { value: Partial<Product>; onCancel: () => void; onSave: (p: Partial<Product>) => void }) {
  const [f, setF] = useState<Partial<Product>>(value);
  return (
    <Card><CardContent className="space-y-2 p-3">
      <div><Label className="text-xs">Name</Label><Input value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div><Label className="text-xs">Price (₱)</Label><Input type="number" step="0.01" value={f.price_cents != null ? f.price_cents / 100 : ""} onChange={(e) => setF({ ...f, price_cents: Math.round(Number(e.target.value) * 100) })} /></div>
      <div><Label className="text-xs">Description</Label><Textarea rows={2} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">Sort order</Label><Input type="number" value={f.sort_order ?? 0} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></div>
        <label className="flex items-end gap-2 text-xs"><input type="checkbox" checked={f.active ?? true} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Active</label>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" className="flex-1" onClick={() => onSave(f)}>Save</Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
      </div>
    </CardContent></Card>
  );
}

function GuidesPanel() {
  const [items, setItems] = useState<Guide[]>([]);
  const [editing, setEditing] = useState<Partial<Guide> | null>(null);

  async function load() {
    const { data, error } = await supabase.from("guides").select("*").order("sort_order");
    if (error) return toast.error("Load failed");
    setItems((data ?? []) as Guide[]);
  }
  useEffect(() => { load(); }, []);

  async function save(g: Partial<Guide>) {
    const payload = {
      category: (g.category ?? "breastfeeding") as Guide["category"],
      title: g.title?.trim() ?? "",
      summary: g.summary?.trim() ?? "",
      body: g.body?.trim() ?? "",
      sort_order: Number(g.sort_order ?? 0),
    };
    if (!payload.title || !payload.body) return toast.error("Fill title and body");
    if (g.id) {
      const { error } = await supabase.from("guides").update(payload).eq("id", g.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("guides").insert(payload);
      if (error) return toast.error(error.message);
    }
    setEditing(null);
    toast.success("Saved");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this guide?")) return;
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        These add to the 100+ built-in guides. Users see built-in guides plus these on the Guides tab.
      </p>
      {editing ? (
        <GuideForm value={editing} onCancel={() => setEditing(null)} onSave={save} />
      ) : (
        <Button className="w-full" onClick={() => setEditing({ category: "breastfeeding", sort_order: items.length + 1 })}>
          <Plus className="mr-1 h-4 w-4" aria-hidden /> Add guide
        </Button>
      )}
      <ul className="space-y-2">
        {items.map((g) => (
          <li key={g.id}>
            <Card><CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{g.category}</p>
                  <p className="text-sm font-semibold text-foreground">{g.title}</p>
                  <p className="text-xs text-muted-foreground">{g.summary}</p>
                </div>
                <button onClick={() => setEditing(g)} aria-label="Edit" className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(g.id)} aria-label="Delete" className="rounded-lg p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardContent></Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuideForm({ value, onCancel, onSave }: { value: Partial<Guide>; onCancel: () => void; onSave: (g: Partial<Guide>) => void }) {
  const [f, setF] = useState<Partial<Guide>>(value);
  return (
    <Card><CardContent className="space-y-2 p-3">
      <div>
        <Label className="text-xs">Category</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={f.category ?? "breastfeeding"}
          onChange={(e) => setF({ ...f, category: e.target.value as Guide["category"] })}
        >
          <option value="breastfeeding">Breastfeeding</option>
          <option value="postpartum">Postpartum</option>
          <option value="recipes">Recipes</option>
        </select>
      </div>
      <div><Label className="text-xs">Title</Label><Input value={f.title ?? ""} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div><Label className="text-xs">Summary</Label><Input value={f.summary ?? ""} onChange={(e) => setF({ ...f, summary: e.target.value })} /></div>
      <div><Label className="text-xs">Body</Label><Textarea rows={5} value={f.body ?? ""} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
      <div><Label className="text-xs">Sort order</Label><Input type="number" value={f.sort_order ?? 0} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" className="flex-1" onClick={() => onSave(f)}>Save</Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
      </div>
    </CardContent></Card>
  );
}

function ForumPanel() {
  const [posts, setPosts] = useState<ForumPost[]>([]);

  async function load() {
    const { data, error } = await supabase
      .from("forum_posts")
      .select("id,name,body,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return toast.error("Load failed");
    setPosts((data ?? []) as ForumPost[]);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    const { data, error } = await supabase.rpc("admin_delete_forum_post", { post_id: id });
    if (error || data === false) return toast.error("Delete failed");
    toast.success("Deleted");
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Admins can remove any post.
      </p>
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Card><CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/85">{p.body}</p>
                </div>
                <button onClick={() => remove(p.id)} aria-label="Delete" className="rounded-lg p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardContent></Card>
          </li>
        ))}
        {posts.length === 0 ? (
          <li className="text-center text-sm text-muted-foreground">No posts yet.</li>
        ) : null}
      </ul>
    </div>
  );
}