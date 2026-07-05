export const PAN_REGEX = /^[a-zA-z]{5}\d{4}[a-zA-Z]{1}$/;
export const GST_REGEX =
  /^[0123][0-9][a-z]{5}[0-9]{4}[a-z][0-9][a-z0-9][a-z0-9]$/i;

export const businessTypes = [
  { value: "individual", label: "Individual" },
  { value: "partnership", label: "Partnership" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "llp", label: "Limited Liability Partnership" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "ngo", label: "NGO" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
  { value: "educational_institutes", label: "Educational Institutes" },
  { value: "not_yet_registered", label: "Not Yet Registered" },
  { value: "other", label: "Other" },
];

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
