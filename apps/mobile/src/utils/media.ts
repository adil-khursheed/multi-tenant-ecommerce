export type MediaSource =
  | string
  | { url?: string | null; caption?: unknown; id?: string | number }
  | null
  | undefined;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

/**
 * Resolve a Payload media reference into an absolute URL.
 * Media is stored with relative paths, so the API origin is prepended.
 */
export function getImageUrl(media: MediaSource): string | null {
  if (!media) return null;

  const url = typeof media === "string" ? media : (media.url ?? null);
  if (!url) return null;
  // Media can be stored as an absolute URL (e.g. Vercel Blob) or relative path.
  if (/^https?:\/\//.test(url)) return url;
  return `${API_URL}${url}`;
}
