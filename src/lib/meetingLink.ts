const VIDEO_HOSTS = [
  "meet.google.com",
  "zoom.us",
  "zoom.com",
  "teams.microsoft.com",
  "teams.live.com",
];

function hostAllowed(hostname: string) {
  const host = hostname.toLowerCase();
  return VIDEO_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/** Sala ao vivo (Cal/Meet). /reuniao/[id] e placeholders não são o link de acesso. */
export function isLiveMeetingLink(url?: string | null) {
  return Boolean(officialMeetingUrl(url));
}

export function officialMeetingUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!/^https:\/\//i.test(trimmed)) return null;
  if (trimmed.toLowerCase().includes("pending")) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return null;
    if (parsed.pathname.startsWith("/reuniao/")) return null;
    if (!hostAllowed(parsed.hostname)) return null;
    return trimmed;
  } catch {
    return null;
  }
}
