import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Bitcoin, Truck, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Store — LactaSupport PH" },
      {
        name: "description",
        content:
          "Order the LactaSupport Kit and 30-Days Replenish Package. Pay via InstaPay, PESONet, crypto, COD, debit or credit.",
      },
    ],
  }),
  component: StorePage,
});

const PRODUCTS = [
  {
    id: "kit",
    name: "LactaSupport Kit",
    price: "₱1,650.00",
    tagline: "Starter bundle for new nanays",
    bullets: [
      "Lactation-boosting herbal blend",
      "Nursing essentials + care guide",
      "30-day usage plan included",
    ],
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "replenish",
    name: "LactaSupport 30-Days Replenish Package",
    price: "₱850.00",
    tagline: "Monthly refill after the starter kit",
    bullets: [
      "One-month herbal supply",
      "Free delivery on orders 2+",
      "Subscribe to save (coming soon)",
    ],
    tone: "bg-secondary text-secondary-foreground",
  },
] as const;

const PAYMENTS = [
  { label: "InstaPay", Icon: Wallet },
  { label: "PESONet", Icon: Wallet },
  { label: "Crypto", Icon: Bitcoin },
  { label: "Cash on Delivery", Icon: Truck },
  { label: "Debit / Credit Card", Icon: CreditCard },
] as const;

function StorePage() {
  const orderLink = (name: string) =>
    `sms:?&body=${encodeURIComponent(`Hi LactaSupport! I'd like to order: ${name}.`)}`;

  return (
    <AppShell title="Store" subtitle="Buy directly from LactaSupport PH">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <p className="text-xs text-foreground/80">
            Message us to reserve your order. Payment methods below — pick what's easiest for you.
          </p>
        </CardContent>
      </Card>

      <ul className="mt-4 space-y-4">
        {PRODUCTS.map((p) => (
          <li key={p.id}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${p.tone}`}>
                    <ShoppingBag className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.tagline}</p>
                    <p className="mt-2 text-lg font-bold text-primary">{p.price}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button asChild variant="secondary">
                    <a href={orderLink(p.name)}>
                      <MessageCircle className="mr-1 h-4 w-4" aria-hidden /> Reserve
                    </a>
                  </Button>
                  <Button asChild>
                    <a href="tel:09171234567">Call to order</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Payment methods
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENTS.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground"
            >
              <Icon className="h-4 w-4 text-primary" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          After reserving, we'll send the payment details for your chosen method and confirm your
          shipping address.
        </p>
      </section>
    </AppShell>
  );
}