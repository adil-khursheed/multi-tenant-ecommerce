export const PAN_REGEX = /^[a-zA-z]{5}\d{4}[a-zA-Z]{1}$/;
export const GST_REGEX =
  /^[0123][0-9][a-z]{5}[0-9]{4}[a-z][0-9][a-z0-9][a-z0-9]$/gi;

export type SortFilterItem = {
  reverse: boolean;
  slug: null | string;
  title: string;
};

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: "Alphabetic A-Z",
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: "-createdAt", reverse: true, title: "Latest arrivals" },
  { slug: "priceInINR", reverse: false, title: "Price: Low to high" }, // asc
  { slug: "-priceInINR", reverse: true, title: "Price: High to low" },
];
