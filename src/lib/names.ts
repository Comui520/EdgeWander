export type NameEntry = {
  name: string;
  message: string;
  at: number;
};

function stripControls(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    // Drop ASCII control chars (0x00-0x1F and 0x7F) but keep everything else,
    // including CJK, emoji, and printable punctuation.
    if (code < 0x20 || code === 0x7f) continue;
    out += ch;
  }
  return out;
}

export function sanitizeName(raw: unknown): string {
  const s = typeof raw === "string" ? raw : "";
  return stripControls(s).trim().slice(0, 24);
}

export function sanitizeMessage(raw: unknown): string {
  const s = typeof raw === "string" ? raw : "";
  return stripControls(s).trim().slice(0, 140);
}
