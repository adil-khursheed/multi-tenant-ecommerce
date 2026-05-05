export const formatSlug = (val: string): string => {
  return val
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters (like ', !, ?, etc)
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};
