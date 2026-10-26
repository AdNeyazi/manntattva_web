export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Only http(s) links are ever rendered as <a href>, whatever the server sends.
export const isWebUrl = (value: string | undefined): value is string =>
  typeof value === "string" && /^https?:\/\/\S+$/.test(value);
