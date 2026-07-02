// Lightweight localStorage helpers. Works offline; safe on SSR (returns defaults).

const isBrowser = typeof window !== "undefined";

export function loadList<T>(key: string): T[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function saveList<T>(key: string, list: T[]): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
}

export function loadObject<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveObject<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export type FeedEntry = {
  id: string;
  timestamp: number;
  side: "left" | "right" | "both" | "bottle";
  minutes: number;
  volumeMl?: number;
  notes?: string;
};

export type DiaperEntry = {
  id: string;
  timestamp: number;
  type: "wet" | "dirty" | "both";
  notes?: string;
};

export const FEED_KEY = "lacta.feeds.v1";
export const DIAPER_KEY = "lacta.diapers.v1";
export const REMINDERS_KEY = "lacta.reminders.v1";
export const PROFILE_KEY = "lacta.profile.v1";