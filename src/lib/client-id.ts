// Stable per-browser ID for delete-own-post RLS on the forum.
const KEY = "lacta.clientId.v1";

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}