import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Baby, MapPin, BookOpen, Bell, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroMother from "@/assets/hero-mother.jpg";
import { loadList, FEED_KEY, DIAPER_KEY, type FeedEntry, type DiaperEntry } from "@/lib/storage";

export const Route = createFileRoute("/")({
  component: Index,
});

const QUICK = [
  { to: "/tracker", label: "Log Feeding", Icon: Baby, tone: "bg-primary/10 text-primary" },
  { to: "/locator", label: "Find Center", Icon: MapPin, tone: "bg-secondary text-secondary-foreground" },
  { to: "/guides", label: "Guides", Icon: BookOpen, tone: "bg-accent text-accent-foreground" },
  { to: "/reminders", label: "SMS Alerts", Icon: Bell, tone: "bg-primary/10 text-primary" },
] as const;

function Index() {
  const [online, setOnline] = useState(true);
  const [todayFeeds, setTodayFeeds] = useState(0);
  const [todayDiapers, setTodayDiapers] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const feeds = loadList<FeedEntry>(FEED_KEY).filter((f) => f.timestamp >= startOfDay.getTime());
    const diapers = loadList<DiaperEntry>(DIAPER_KEY).filter(
      (d) => d.timestamp >= startOfDay.getTime(),
    );
    setTodayFeeds(feeds.length);
    setTodayDiapers(diapers.length);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-accent/40 to-secondary/60 p-5 shadow-sm">
        <div className="relative z-10 max-w-[70%]">
          <p className="text-xs font-medium uppercase tracking-wider text-primary/80">
            Kumusta, Nanay
          </p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-foreground">
            LactaSupport PH DigiCare
          </h1>
          <p className="mt-2 text-sm text-foreground/75">
            Kaagapay mo sa pagpapasuso at pag-aalaga sa iyong sanggol.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80">
            {online ? (
              <>
                <Wifi className="h-3.5 w-3.5" aria-hidden /> Online
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" aria-hidden /> Offline — still works
              </>
            )}
          </div>
        </div>
        <img
          src={heroMother}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -bottom-6 h-40 w-40 rounded-full object-cover opacity-90"
        />
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Feedings today
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{todayFeeds}</p>
            <p className="mt-1 text-xs text-muted-foreground">Goal: 8-12 sa isang araw</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Diapers today
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{todayDiapers}</p>
            <p className="mt-1 text-xs text-muted-foreground">6+ basang lampin = busog</p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map(({ to, label, Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-transform active:scale-[0.98]"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MessageCircle className="h-4 w-4" aria-hidden />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Tip ng araw
                </p>
                <p className="mt-1 text-sm text-foreground/80">
                  Uminom ng isang basong tubig bago at pagkatapos magpasuso — nakakatulong ito sa
                  gatas mo.
                </p>
                <Button asChild size="sm" variant="secondary" className="mt-3">
                  <Link to="/guides">Basahin pa</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
