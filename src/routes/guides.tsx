import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Baby, HeartPulse, Utensils, Search } from "lucide-react";
import { BREASTFEEDING, POSTPARTUM, RECIPES, type Guide } from "@/lib/guides-data";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides — LactaSupport PH" },
      {
        name: "description",
        content:
          "100+ offline guides on breastfeeding, postpartum care, and budget lactation recipes in Tagalog and English.",
      },
    ],
  }),
  component: GuidesPage,
});

const TABS = [
  { key: "breastfeeding", label: "Breastfeeding", Icon: Baby, data: BREASTFEEDING },
  { key: "postpartum", label: "Postpartum", Icon: HeartPulse, data: POSTPARTUM },
  { key: "recipes", label: "Recipes", Icon: Utensils, data: RECIPES },
] as const;

function GuidesPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("breastfeeding");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const source = TABS.find((t) => t.key === tab)!.data;
    if (!term) return source;
    return source.filter(
      (g) =>
        g.title.toLowerCase().includes(term) ||
        g.summary.toLowerCase().includes(term) ||
        g.body.toLowerCase().includes(term),
    );
  }, [q, tab]);

  const total = BREASTFEEDING.length + POSTPARTUM.length + RECIPES.length;

  return (
    <AppShell title="Offline Guides" subtitle={`${total}+ articles — walang internet na kailangan`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all guides…"
          className="pl-9"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {TABS.map(({ key, label, Icon, data }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-card text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{label}</span>
              <span className="text-[10px] opacity-70">{data.length} articles</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
        {filtered.length} result{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <Card className="mt-2">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Walang nahanap. Subukan ang ibang keyword.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="mt-2 rounded-2xl border border-border/60 bg-card">
          {filtered.map((g: Guide) => (
            <AccordionItem key={g.id} value={g.id} className="px-4">
              <AccordionTrigger className="text-left">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{g.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{g.summary}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-foreground/80">{g.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </AppShell>
  );
}