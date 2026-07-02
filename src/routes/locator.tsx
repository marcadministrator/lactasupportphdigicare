import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/locator")({
  head: () => ({
    meta: [
      { title: "Health Centers — LactaSupport PH" },
      {
        name: "description",
        content: "Fast, text-only directory of Barangay Health Centers and emergency hotlines.",
      },
    ],
  }),
  component: LocatorPage,
});

const CENTERS = [
  {
    name: "Barangay Health Center — Sto. Niño",
    address: "Purok 3, Brgy. Sto. Niño",
    hours: "Mon–Sat, 8:00 AM – 5:00 PM",
    phone: "09171234567",
  },
  {
    name: "Rural Health Unit I",
    address: "Poblacion, near Municipal Hall",
    hours: "Mon–Fri, 8:00 AM – 4:00 PM",
    phone: "09182223344",
  },
  {
    name: "Lying-in Clinic — San Isidro",
    address: "Sitio Malipayon, Brgy. San Isidro",
    hours: "24 hours (on-call midwife)",
    phone: "09209988776",
  },
  {
    name: "Barangay Health Station — Malanday",
    address: "Malanday Covered Court",
    hours: "Tue & Thu, 9:00 AM – 3:00 PM",
    phone: "09175556677",
  },
];

export default function LocatorPage() {
  return (
    <AppShell title="Health Centers" subtitle="Text-only, loads offline">
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Emergency</p>
            <p className="mt-1 text-xs text-foreground/75">
              For urgent postpartum bleeding, fever, or baby not breathing well — tumawag agad.
            </p>
            <Button asChild variant="destructive" size="sm" className="mt-3 w-full">
              <a href="tel:911">
                <Phone className="mr-2 h-4 w-4" aria-hidden /> Call 911
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <h2 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Nearby centers
      </h2>
      <ul className="space-y-3">
        {CENTERS.map((c) => (
          <li key={c.name}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.address}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.hours}</p>
                    <Button asChild size="sm" variant="secondary" className="mt-3">
                      <a href={`tel:${c.phone}`}>
                        <Phone className="mr-2 h-4 w-4" aria-hidden /> {c.phone}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}