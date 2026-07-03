import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  distanceKm: number | null;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  openNow?: boolean | null;
  mapsUrl: string;
};

const KIND_TO_TYPES: Record<string, string[]> = {
  hospital: ["hospital"],
  clinic: ["doctor", "medical_lab"],
  health_center: ["hospital", "doctor"],
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const searchNearbyPlaces = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        kind: z.enum(["hospital", "clinic", "health_center"]),
        radiusMeters: z.number().min(500).max(50000).default(5000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const connKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey || !connKey) throw new Error("Google Maps connector is not configured");

    const body = {
      includedTypes: KIND_TO_TYPES[data.kind],
      maxResultCount: 15,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: data.latitude, longitude: data.longitude },
          radius: data.radiusMeters,
        },
      },
    };

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchNearby`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Connection-Api-Key": connKey,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.currentOpeningHours.openNow,places.googleMapsUri",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude: number; longitude: number };
        nationalPhoneNumber?: string;
        internationalPhoneNumber?: string;
        rating?: number;
        currentOpeningHours?: { openNow?: boolean };
        googleMapsUri?: string;
      }>;
    };

    const origin = { lat: data.latitude, lng: data.longitude };
    const places: NearbyPlace[] = (json.places ?? []).map((p) => {
      const lat = p.location?.latitude ?? 0;
      const lng = p.location?.longitude ?? 0;
      return {
        id: p.id,
        name: p.displayName?.text ?? "Unnamed",
        address: p.formattedAddress ?? "",
        distanceKm: p.location ? haversineKm(origin, { lat, lng }) : null,
        latitude: lat,
        longitude: lng,
        phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber,
        rating: p.rating,
        openNow: p.currentOpeningHours?.openNow ?? null,
        mapsUrl: p.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      };
    });

    return { places };
  });