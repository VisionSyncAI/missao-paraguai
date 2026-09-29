export function safeInternalPath(raw: string | null | undefined, fallback: string, prefixes: string[]) {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || /[a-z]+:/i.test(raw)) {
    return fallback;
  }
  const pathOnly = raw.split("?")[0] || "";
  const allowed = prefixes.some((prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`));
  return allowed ? raw : fallback;
}
