type RawLink = {
  link: {
    type?: string | null;
    newTab?: boolean | null;
    reference?: {
      relationTo: string;
      value: { slug?: string; [k: string]: unknown } | string;
    } | null;
    url?: string | null;
    label: string;
    appearance?: string | null;
  };
};

export type ResolvedLink = {
  href: string;
  label: string;
  appearance: string;
  newTab?: boolean | null;
};

export function resolveLink(rawLink: RawLink | null | undefined): ResolvedLink | null {
  const link = rawLink?.link;
  if (!link) return null;

  let href = "";
  if (link.type === "custom" && link.url) {
    href = link.url;
  } else if (
    link.type === "reference" &&
    link.reference?.value &&
    typeof link.reference.value === "object" &&
    link.reference.value.slug
  ) {
    const prefix = link.reference.relationTo === "pages" ? "" : `/${link.reference.relationTo}`;
    href = `${prefix}/${link.reference.value.slug}`;
  }

  if (!href) return null;

  return {
    href,
    label: link.label,
    appearance: link.appearance ?? "default",
    newTab: link.newTab ?? null,
  };
}

export function resolveLinks(
  rawLinks: RawLink[] | null | undefined,
): ResolvedLink[] {
  if (!rawLinks?.length) return [];
  return rawLinks
    .map((raw) => resolveLink(raw))
    .filter((link): link is ResolvedLink => link !== null);
}
