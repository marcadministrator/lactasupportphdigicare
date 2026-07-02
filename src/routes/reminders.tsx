import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loadObject, saveObject, REMINDERS_KEY } from "@/lib/storage";
import { Bell, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "SMS Reminders — LactaSupport PH" },
      {
        name: "description",
        content: "Standard SMS alerts for feeding, hydration, and postpartum check-ins.",
      },
    ],
  }),
  component: RemindersPage,
});

type Prefs = {
  phone: string;
  feeding: boolean;
  hydration: boolean;
  postpartum: boolean;
  tips: boolean;
};

const DEFAULTS: Prefs = {
  phone: "",
  feeding: true,
  hydration: true,
  postpartum: true,
  tips: false,
};

function RemindersPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    setPrefs(loadObject<Prefs>(REMINDERS_KEY, DEFAULTS));
  }, []);

  function update<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    saveObject(REMINDERS_KEY, next);
  }

  function save() {
    saveObject(REMINDERS_KEY, prefs);
    toast.success("Preferences saved");
  }

  return (
    <AppShell title="SMS Reminders" subtitle="Standard text — walang internet na kailangan">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex-1">
              <Label htmlFor="phone" className="text-sm font-medium">
                Cellphone number
              </Label>
              <p className="text-xs text-muted-foreground">
                Ipapadala ang text messages sa numerong ito.
              </p>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="09XX XXX XXXX"
                className="mt-2"
                value={prefs.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Alert types
      </h2>
      <div className="space-y-2">
        <Toggle
          label="Feeding reminders"
          desc="Every 3 hours during the day"
          value={prefs.feeding}
          onChange={(v) => update("feeding", v)}
        />
        <Toggle
          label="Hydration alerts"
          desc="Paalala uminom ng tubig"
          value={prefs.hydration}
          onChange={(v) => update("hydration", v)}
        />
        <Toggle
          label="Postpartum check-ins"
          desc="Health tracking sa 1, 2, 6 weeks after delivery"
          value={prefs.postpartum}
          onChange={(v) => update("postpartum", v)}
        />
        <Toggle
          label="Weekly milestone tips"
          desc="Baby growth at breastfeeding tips"
          value={prefs.tips}
          onChange={(v) => update("tips", v)}
        />
      </div>

      <Button onClick={save} className="mt-6 w-full">
        <Bell className="mr-2 h-4 w-4" /> Save preferences
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Standard SMS rates may apply from your carrier.
      </p>
    </AppShell>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
      </CardContent>
    </Card>
  );
}