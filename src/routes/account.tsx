import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserCircle2, LogOut, ShieldCheck } from "lucide-react";
import { loadObject, saveObject, PROFILE_KEY } from "@/lib/storage";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — LactaSupport PH" },
      { name: "description", content: "Your local profile for LactaSupport PH DigiCare." },
    ],
  }),
  component: AccountPage,
});

type Profile = {
  name?: string;
  phone?: string;
  barangay?: string;
  babyName?: string;
  babyBirth?: string;
  createdAt?: number;
};

function AccountPage() {
  const [p, setP] = useState<Profile>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setP(loadObject<Profile>(PROFILE_KEY, {}));
    setLoaded(true);
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!p.name?.trim()) {
      toast.error("Pakilagay ang pangalan.");
      return;
    }
    const next: Profile = { ...p, createdAt: p.createdAt ?? Date.now() };
    saveObject(PROFILE_KEY, next);
    setP(next);
    toast.success("Naka-save ang iyong account");
  }

  function signOut() {
    if (!confirm("Burahin ang lokal na account? Mananatili ang iyong logs.")) return;
    saveObject(PROFILE_KEY, {});
    setP({});
    toast.success("Nag-sign out ka na");
  }

  const hasAccount = !!p.createdAt;

  return (
    <AppShell title="Account" subtitle="Naka-save lokal sa telepono mo — walang cloud">
      <Card className="border-secondary/60 bg-secondary/30">
        <CardContent className="flex items-start gap-3 p-4">
          <UserCircle2 className="mt-0.5 h-6 w-6 text-secondary-foreground" aria-hidden />
          <div className="text-xs text-secondary-foreground">
            {hasAccount ? (
              <>Kumusta, <span className="font-semibold">{p.name}</span>! Kaya mong baguhin ang detalye mo dito.</>
            ) : (
              <>Gumawa ng simpleng account para ma-personalize ang app. Walang email o password.</>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={save} className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-card p-4">
        <Field id="name" label="Pangalan / Palayaw" value={p.name} onChange={(v) => setP({ ...p, name: v })} placeholder="Nanay Maria" />
        <Field id="phone" label="Numero ng telepono (para sa SMS)" value={p.phone} onChange={(v) => setP({ ...p, phone: v })} placeholder="09XX XXX XXXX" inputMode="tel" />
        <Field id="barangay" label="Barangay" value={p.barangay} onChange={(v) => setP({ ...p, barangay: v })} placeholder="Brgy. San Isidro" />
        <div className="grid grid-cols-2 gap-3">
          <Field id="babyName" label="Pangalan ng sanggol" value={p.babyName} onChange={(v) => setP({ ...p, babyName: v })} placeholder="Baby" />
          <Field id="babyBirth" label="Kaarawan ng sanggol" type="date" value={p.babyBirth} onChange={(v) => setP({ ...p, babyBirth: v })} />
        </div>
        <Button type="submit" className="w-full" disabled={!loaded}>
          {hasAccount ? "I-update ang account" : "Gumawa ng account"}
        </Button>
      </form>

      {hasAccount ? (
        <button
          type="button"
          onClick={signOut}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Burahin ang account
        </button>
      ) : null}

      <Link
        to="/admin"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden /> Administrator Portal
      </Link>
    </AppShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type,
  inputMode,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}