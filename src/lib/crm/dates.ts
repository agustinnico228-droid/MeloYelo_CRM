/**
 * Tolerant CRM date parsing (§9.4). Live data mixes at least
 * "08/06/2026 19:56:21" and "2:47pm 26/10/25". On failure callers show
 * the raw string — never "Invalid Date".
 */

const DMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const HMA_DMY = /^(\d{1,2}):(\d{2})\s*(am|pm)\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/i;

function build(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  const d = new Date(year, month - 1, day, hour, minute, second);
  // Reject silent overflow like 31/02
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export function parseCrmDate(raw: string): Date | null {
  const value = raw.trim();
  if (value === "") return null;

  let m = value.match(DMY);
  if (m) {
    return build(
      Number(m[3]),
      Number(m[2]),
      Number(m[1]),
      m[4] ? Number(m[4]) : 0,
      m[5] ? Number(m[5]) : 0,
      m[6] ? Number(m[6]) : 0,
    );
  }

  m = value.match(HMA_DMY);
  if (m) {
    let hour = Number(m[1]) % 12;
    if (m[3].toLowerCase() === "pm") hour += 12;
    const yearNum = Number(m[6]);
    const year = m[6].length === 2 ? 2000 + yearNum : yearNum;
    return build(year, Number(m[5]), Number(m[4]), hour, Number(m[2]));
  }

  return null;
}

/** Friendly rendering, falling back to the raw string on parse failure. */
export function describeCrmDate(raw: string): string {
  const d = parseCrmDate(raw);
  if (!d) return raw;
  return d.toLocaleString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 60_000);
}

/** "just now", "3 h", "2 days" — for "time waiting" style labels. */
export function timeSince(raw: string, now: Date = new Date()): string | null {
  const d = parseCrmDate(raw);
  if (!d) return null;
  const mins = minutesBetween(d, now);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.floor(hours / 24)} days`;
}
