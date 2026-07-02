import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Baby, MapPin, BookOpen, MessageCircle, Bell, User } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/tracker", label: "Track", Icon: Baby },
  { to: "/locator", label: "Centers", Icon: MapPin },
  { to: "/guides", label: "Guides", Icon: BookOpen },
  { to: "/forum", label: "Forum", Icon: MessageCircle },
  { to: "/reminders", label: "SMS", Icon: Bell },
  { to: "/account", label: "Account", Icon: User },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      {title ? (
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-5 pb-3 pt-5 backdrop-blur-md">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      ) : null}

      <main className="flex-1 px-5 pb-28 pt-4">{children}</main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border/70 bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur"
      >
        <ul className="grid grid-cols-7 gap-1">
          {NAV.map(({ to, label, Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}