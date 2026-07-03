import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Hospital,
  Stethoscope,
  Star,
  ExternalLink,
  LocateFixed,
} from "lucide-react";
import { searchNearbyPlaces, type NearbyPlace } from "@/lib/maps.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/locator")({
  head: () => ({
    meta: [
      { title: "Care Near Me — LactaSupport PH" },
      {
        name: "description",
        content: "Find the nearest barangay health centers and hospitals using live GPS.",
      },
    ],
  }),
  component: LocatorPage,
});

type Coords = { lat: number; lng: number };

function LocatorPage() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [centers, setCenters] = useState<NearbyPlace[]>([]);
  const [hospitals, setHospitals] = useState<NearbyPlace[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const search = useServerFn(searchNearbyPlaces);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Location not supported on this device");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setGeoError(err.message || "Couldn't get your location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const loadCenters = useCallback(async () => {
    if (!coords) return;
    setLoadingCenters(true);
    try {
      const { places } = await search({
        data: { latitude: coords.lat, longitude: coords.lng, kind: "clinic", radiusMeters: 5000 },
      });
      setCenters(places);
    } catch (e) {
      toast.error("Couldn't load health centers");
      console.error(e);
    } finally {
      setLoadingCenters(false);
    }
  }, [coords, search]);

  const loadHospitals = useCallback(async () => {
    if (!coords) return;
    setLoadingHospitals(true);
    try {
      const { places } = await search({
        data: { latitude: coords.lat, longitude: coords.lng, kind: "hospital", radiusMeters: 10000 },
      });
      setHospitals(places);
    } catch (e) {
      toast.error("Couldn't load hospitals");
      console.error(e);
    } finally {
      setLoadingHospitals(false);
    }
  }, [coords, search]);

  useEffect(() => {
    if (coords) {
      loadCenters();
      loadHospitals();
    }
  }, [coords, loadCenters, loadHospitals]);

  return (
    <AppShell title="Care Near Me" subtitle="Live GPS · nearest centers & hospitals">
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Emergency</p>
            <p className="mt-1 text-xs text-foreground/75">
              Postpartum bleeding, high fever, or baby not breathing well — tumawag agad.
            </p>
            <Button asChild variant="destructive" size="sm" className="mt-3 w-full">
              <a href="tel:911">
                <Phone className="mr-2 h-4 w-4" aria-hidden /> Call 911
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="flex items-center gap-3 p-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Navigation className="h-4 w-4" aria-hidden />
          </span>
          <div className="flex-1 text-xs">
            {coords ? (
              <>
                <p className="font-medium text-foreground">Your location</p>
                <p className="text-muted-foreground">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              </>
            ) : geoError ? (
              <p className="text-destructive">{geoError}</p>
            ) : (
              <p className="text-muted-foreground">
                {locating ? "Getting your GPS location…" : "Location not set"}
              </p>
            )}
          </div>
          <Button size="sm" variant="secondary" onClick={locate} disabled={locating}>
            <LocateFixed className={`mr-1 h-4 w-4 ${locating ? "animate-pulse" : ""}`} aria-hidden />
            {locating ? "…" : "Refresh"}
          </Button>
        </CardContent>
      </Card>

      <Section
        Icon={Stethoscope}
        title="Health centers nearby"
        subtitle="Clinics & barangay health workers"
        loading={loadingCenters}
        onRefresh={loadCenters}
        places={centers}
        emptyHint="No centers found within 5 km."
        physicianNote={false}
      />

      <Section
        Icon={Hospital}
        title="Hospitals nearby"
        subtitle="Call to confirm on-duty physician"
        loading={loadingHospitals}
        onRefresh={loadHospitals}
        places={hospitals}
        emptyHint="No hospitals found within 10 km."
        physicianNote={true}
      />
    </AppShell>
  );
}

function Section({
  Icon,
  title,
  subtitle,
  loading,
  onRefresh,
  places,
  emptyHint,
  physicianNote,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  loading: boolean;
  onRefresh: () => void;
  places: NearbyPlace[];
  emptyHint: string;
  physicianNote: boolean;
}) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </Button>
      </div>

      {loading && places.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          Searching…
        </p>
      ) : places.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          {emptyHint}
        </p>
      ) : (
        <ul className="space-y-3">
          {places.map((p) => (
            <li key={p.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <MapPin className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.address}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {p.distanceKm != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Navigation className="h-3 w-3" aria-hidden />
                            {p.distanceKm < 1
                              ? `${Math.round(p.distanceKm * 1000)} m`
                              : `${p.distanceKm.toFixed(1)} km`}
                          </span>
                        ) : null}
                        {p.rating ? (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3 w-3" aria-hidden /> {p.rating.toFixed(1)}
                          </span>
                        ) : null}
                        {p.openNow === true ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Open now
                          </span>
                        ) : p.openNow === false ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Closed
                          </span>
                        ) : null}
                      </div>
                      {physicianNote ? (
                        <p className="mt-2 text-[11px] italic text-muted-foreground">
                          Tumawag muna para makumpirma kung sino ang on-duty na OB/pedia.
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.phone ? (
                          <Button asChild size="sm" variant="secondary">
                            <a href={`tel:${p.phone}`}>
                              <Phone className="mr-1 h-4 w-4" aria-hidden /> {p.phone}
                            </a>
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="outline">
                          <a href={p.mapsUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1 h-4 w-4" aria-hidden /> Directions
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}