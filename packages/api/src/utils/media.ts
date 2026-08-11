/**
 * Resolve a Payload media reference into an absolute URL.
 *
 * The tRPC server runs inside the Next.js web app, where only
 * NEXT_PUBLIC_* / PAYLOAD_PUBLIC_* vars are defined. EXPO_PUBLIC_API_URL is
 * defined only in the Expo bundler, so it must be a fallback (never the first).
 */
export function getServerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    ""
  );
}

export type MediaReference =
  | { url?: string | null; caption?: unknown; id?: string | number }
  | string
  | null
  | undefined;

export function resolveMediaUrl(media: MediaReference): string | null {
  if (!media) return null;
  const url = typeof media === "object" ? media.url : media;
  if (!url) return null;
  // Media can be stored as an absolute URL (e.g. Vercel Blob) or relative path.
  if (/^https?:\/\//.test(url)) return url;
  return `${url}`;
}

export function resolveMedia(media: MediaReference): {
  url: string | null;
  caption: unknown;
} {
  if (!media) return { url: null, caption: null };

  if (typeof media === "object") {
    return {
      url: resolveMediaUrl(media),
      caption: media.caption ?? null,
    };
  }

  return { url: resolveMediaUrl(media), caption: null };
}
