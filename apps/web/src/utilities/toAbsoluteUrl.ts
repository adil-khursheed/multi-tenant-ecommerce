import { getServerSideURL } from "./getURL";

export const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;

  try {
    return new URL(url, getServerSideURL()).toString();
  } catch {
    return undefined;
  }
};
