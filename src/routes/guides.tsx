import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Utensils, HeartPulse, Baby } from "lucide-react";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "Guides — LactaSupport PH" },
      {
        name: "description",
        content:
          "Local-language breastfeeding, postpartum, and lactation-boosting recipe guides.",
      },
    ],
  }),
  component: GuidesPage,
});

const RECIPES = [
  {
    name: "Tinolang Manok with Malunggay",
    cost: "~ ₱80 per serving",
    ingredients: ["Manok (chicken)", "Malunggay leaves", "Luya (ginger)", "Sibuyas", "Sayote or papaya"],
    steps:
      "Igisa ang luya at sibuyas. Idagdag ang manok, isunod ang tubig at sayote. Pagluto ng gulay, ihalo ang malunggay bago patayin ang apoy.",
  },
  {
    name: "Munggo with Ampalaya Leaves",
    cost: "~ ₱50 per serving",
    ingredients: ["Munggo", "Ampalaya leaves", "Bawang", "Sibuyas", "Kamatis"],
    steps:
      "Pakuluan ang munggo hanggang lumambot. Igisa ang bawang, sibuyas, at kamatis. Ihalo lahat, tapos idagdag ang dahon ng ampalaya sa huli.",
  },
  {
    name: "Arroz Caldo with Malunggay",
    cost: "~ ₱60 per serving",
    ingredients: ["Bigas", "Manok", "Luya", "Bawang", "Malunggay leaves"],
    steps:
      "Igisa ang bawang at luya. Idagdag ang manok at bigas. Haluan ng tubig, pakuluan hanggang lumapot. Isahog ang malunggay sa huli.",
  },
];

function GuidesPage() {
  return (
    <AppShell title="Guides" subtitle="Pre-loaded — walang data na kailangan">
      <section className="space-y-3">
        <SectionHeading Icon={Baby} label="Breastfeeding basics" />
        <Accordion type="single" collapsible className="rounded-2xl border border-border/60 bg-card">
          <AccordionItem value="latch" className="px-4">
            <AccordionTrigger>Tamang pag-latch</AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/80">
              Siguraduhing bukas ang bibig ng baby na parang humihikab, at malalim ang latch sa
              areola — hindi lang sa utong. Ang tainga, balikat, at balakang ng baby ay dapat
              nakaayos sa isang linya.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="freq" className="px-4">
            <AccordionTrigger>Gaano kadalas magpasuso?</AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/80">
              Sa mga unang linggo, 8–12 beses sa isang araw (kada 2–3 oras). Sundan ang senyales
              ng baby: paghahanap, pagsipsip ng kamay, o paggalaw ng bibig.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="supply" className="px-4">
            <AccordionTrigger>Pagpapadami ng gatas</AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/80">
              Uminom ng maraming tubig, kumain ng malunggay at munggo, at magpasuso nang madalas.
              Habang mas madalas mong pasusuhin, mas dumarami ang gatas.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mt-6 space-y-3">
        <SectionHeading Icon={HeartPulse} label="Postpartum care" />
        <Card>
          <CardContent className="space-y-2 p-4 text-sm text-foreground/80">
            <p>
              <strong className="text-foreground">Pagpapahinga.</strong> Matulog kapag natutulog
              ang baby. Huwag mahiyang humingi ng tulong sa pamilya.
            </p>
            <p>
              <strong className="text-foreground">Warning signs.</strong> Kung may matinding
              pagdurugo, lagnat na 38°C+, matinding sakit ng suso o binti, kumonsulta agad.
            </p>
            <p>
              <strong className="text-foreground">Emotional health.</strong> Normal ang &ldquo;baby
              blues&rdquo; sa unang 2 linggo. Kung tumagal o lumala, kausapin ang health worker.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 space-y-3">
        <SectionHeading Icon={Utensils} label="Budget lactation recipes" />
        <div className="space-y-3">
          {RECIPES.map((r) => (
            <Card key={r.name}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                    {r.cost}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Sangkap
                </p>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {r.ingredients.map((i) => (
                    <li
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground"
                    >
                      <Leaf className="h-3 w-3" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-foreground/80">{r.steps}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeading({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
    </div>
  );
}