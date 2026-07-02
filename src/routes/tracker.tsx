import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Baby, Droplet, Trash2, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  loadList,
  saveList,
  FEED_KEY,
  DIAPER_KEY,
  type FeedEntry,
  type DiaperEntry,
} from "@/lib/storage";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Tracker — LactaSupport PH" },
      {
        name: "description",
        content: "Offline breastfeeding and diaper log for Filipino mothers.",
      },
    ],
  }),
  component: TrackerPage,
});

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

function TrackerPage() {
  const [feeds, setFeeds] = useState<FeedEntry[]>([]);
  const [diapers, setDiapers] = useState<DiaperEntry[]>([]);
  const [minutes, setMinutes] = useState<string>("10");
  const [volume, setVolume] = useState<string>("");

  useEffect(() => {
    setFeeds(loadList<FeedEntry>(FEED_KEY));
    setDiapers(loadList<DiaperEntry>(DIAPER_KEY));
  }, []);

  function addFeed(side: FeedEntry["side"]) {
    const entry: FeedEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      side,
      minutes: Math.max(0, parseInt(minutes || "0", 10)),
      volumeMl: volume ? Math.max(0, parseInt(volume, 10)) : undefined,
    };
    const next = [entry, ...feeds];
    setFeeds(next);
    saveList(FEED_KEY, next);
    toast.success("Feeding logged");
  }

  function addDiaper(type: DiaperEntry["type"]) {
    const entry: DiaperEntry = { id: crypto.randomUUID(), timestamp: Date.now(), type };
    const next = [entry, ...diapers];
    setDiapers(next);
    saveList(DIAPER_KEY, next);
    toast.success("Diaper logged");
  }

  function removeFeed(id: string) {
    const next = feeds.filter((f) => f.id !== id);
    setFeeds(next);
    saveList(FEED_KEY, next);
  }
  function removeDiaper(id: string) {
    const next = diapers.filter((d) => d.id !== id);
    setDiapers(next);
    saveList(DIAPER_KEY, next);
  }

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const feedsToday = feeds.filter((f) => f.timestamp >= todayStart).length;
  const diapersToday = diapers.filter((d) => d.timestamp >= todayStart).length;

  const chartData = useMemo(() => {
    const days: { day: string; feeds: number; diapers: number }[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      const s = start.getTime();
      const e = end.getTime();
      days.push({
        day: start.toLocaleDateString([], { weekday: "short" }),
        feeds: feeds.filter((f) => f.timestamp >= s && f.timestamp < e).length,
        diapers: diapers.filter((d) => d.timestamp >= s && d.timestamp < e).length,
      });
    }
    return days;
  }, [feeds, diapers]);

  return (
    <AppShell title="Tracker" subtitle="Simple offline log — no data required">
      <div className="grid grid-cols-2 gap-3">
        <StatChip label="Today's feeds" value={feedsToday} />
        <StatChip label="Today's diapers" value={diapersToday} />
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">7-day overview</p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[hsl(var(--primary))]" /> Feeds
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-[hsl(var(--secondary-foreground))]" /> Diapers
              </span>
            </div>
          </div>
          <ChartContainer
            config={{
              feeds: { label: "Feeds", color: "hsl(var(--primary))" },
              diapers: { label: "Diapers", color: "hsl(var(--secondary-foreground))" },
            }}
            className="h-40 w-full"
          >
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="feeds" fill="var(--color-feeds)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="diapers" fill="var(--color-diapers)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="feed" className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">
            <Baby className="mr-2 h-4 w-4" /> Feeding
          </TabsTrigger>
          <TabsTrigger value="diaper">
            <Droplet className="mr-2 h-4 w-4" /> Diaper
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mins" className="text-xs">
                    Minutes
                  </Label>
                  <Input
                    id="mins"
                    inputMode="numeric"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vol" className="text-xs">
                    Volume (mL) — optional
                  </Label>
                  <Input
                    id="vol"
                    inputMode="numeric"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => addFeed("left")} variant="secondary">
                  <Plus className="mr-1 h-4 w-4" /> Left
                </Button>
                <Button onClick={() => addFeed("right")} variant="secondary">
                  <Plus className="mr-1 h-4 w-4" /> Right
                </Button>
                <Button onClick={() => addFeed("both")}>
                  <Plus className="mr-1 h-4 w-4" /> Both
                </Button>
                <Button onClick={() => addFeed("bottle")} variant="outline">
                  <Plus className="mr-1 h-4 w-4" /> Bottle
                </Button>
              </div>
            </CardContent>
          </Card>

          <EntryList
            emptyLabel="Wala pang feeding logs. Tap a button above to start."
            items={feeds.slice(0, 20).map((f) => ({
              id: f.id,
              title: `${cap(f.side)} • ${f.minutes} min${f.volumeMl ? ` • ${f.volumeMl} mL` : ""}`,
              subtitle: `${fmtDate(f.timestamp)} at ${fmtTime(f.timestamp)}`,
              onDelete: () => removeFeed(f.id),
            }))}
          />
        </TabsContent>

        <TabsContent value="diaper" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => addDiaper("wet")} variant="secondary">
                  Wet
                </Button>
                <Button onClick={() => addDiaper("dirty")} variant="secondary">
                  Dirty
                </Button>
                <Button onClick={() => addDiaper("both")}>Both</Button>
              </div>
            </CardContent>
          </Card>

          <EntryList
            emptyLabel="Wala pang diaper logs."
            items={diapers.slice(0, 20).map((d) => ({
              id: d.id,
              title: cap(d.type),
              subtitle: `${fmtDate(d.timestamp)} at ${fmtTime(d.timestamp)}`,
              onDelete: () => removeDiaper(d.id),
            }))}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EntryList({
  items,
  emptyLabel,
}: {
  items: { id: string; title: string; subtitle: string; onDelete: () => void }[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{it.title}</p>
            <p className="text-xs text-muted-foreground">{it.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={it.onDelete}
            aria-label="Delete entry"
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}