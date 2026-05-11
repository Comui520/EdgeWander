/**
 * Detect if a string looks like it's trying to share a URL. We intentionally
 * over-reject — the guestbook doesn't need links, so false positives just
 * mean someone rewrites their message. Patterns covered:
 *
 *   - explicit schemes (http://, https://, ftp://, ws://, magnet:, mailto:)
 *   - `www.` prefixes
 *   - bare `host.tld` with a common TLD and usually a path
 *   - Unicode-homoglyph dots (．。・) often used to dodge regex filters
 *   - obfuscations like "example [dot] com" or "example(dot)com"
 *   - t.me / bit.ly / tinyurl etc. (covered by the bare-host case)
 *
 * Short strings that happen to contain a common TLD by coincidence
 * ("nice net") are avoided by requiring the TLD to follow a `.` with
 * nothing but a valid host-label character on each side.
 */
const COMMON_TLDS = [
  "com",
  "net",
  "org",
  "io",
  "cn",
  "jp",
  "kr",
  "ru",
  "de",
  "uk",
  "us",
  "co",
  "me",
  "tv",
  "info",
  "biz",
  "xyz",
  "top",
  "vip",
  "app",
  "dev",
  "link",
  "live",
  "site",
  "store",
  "shop",
  "club",
  "online",
  "tech",
  "space",
  "fun",
  "gg",
  "ly",
  "to",
  "cc",
  "icu",
  "wang",
];

function normalize(input: string): string {
  // Unify unicode dots used to bypass filters and collapse " [ dot ] ".
  return input
    .replace(/[．。·・]/g, ".")
    .replace(/\s*[\[\(]\s*dot\s*[\]\)]\s*/gi, ".")
    .replace(/\s*[\[\(]\s*\.\s*[\]\)]\s*/g, ".")
    .toLowerCase();
}

export function containsLink(raw: string): boolean {
  if (!raw) return false;
  const s = normalize(raw);

  if (/\b(?:https?|ftp|wss?|magnet|mailto|tel|data):/i.test(s)) return true;
  if (/\bwww\./i.test(s)) return true;

  // `host.tld` with optional path. Host label: letters/digits/hyphens.
  // TLD: one of the common TLDs above. Optional path after the TLD.
  const tldGroup = COMMON_TLDS.join("|");
  const bareHost = new RegExp(
    `(?:^|[^a-z0-9-])([a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)\\.(${tldGroup})(?:/|[^a-z0-9]|$)`,
    "i",
  );
  if (bareHost.test(s)) return true;

  return false;
}
