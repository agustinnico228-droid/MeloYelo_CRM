import { parseCrmDate } from "./dates";

/**
 * The Notes column is an append-only blob with inline timestamps (§9.7).
 * Apps Script appends entries as "{h:mma dd/MM/yy} {actorName}: {text}".
 * Render as a timeline: split on timestamp patterns; anything before the
 * first timestamp (or a blob with none) becomes a single legacy entry.
 */

export interface NoteEntry {
  /** null for legacy content with no recognisable timestamp */
  timestampRaw: string | null;
  date: Date | null;
  author: string | null;
  text: string;
}

const ENTRY_START = /(\d{1,2}:\d{2}\s*(?:am|pm)\s+\d{1,2}\/\d{1,2}\/\d{2,4})/gi;

export function parseNotes(blob: string): NoteEntry[] {
  const value = blob.trim();
  if (value === "") return [];

  const entries: NoteEntry[] = [];
  const matches = [...value.matchAll(ENTRY_START)];

  if (matches.length === 0 || matches[0].index! > 0) {
    const legacyEnd = matches.length === 0 ? value.length : matches[0].index!;
    const legacy = value.slice(0, legacyEnd).trim();
    if (legacy !== "") {
      entries.push({
        timestampRaw: null,
        date: null,
        author: null,
        text: legacy,
      });
    }
  }

  matches.forEach((m, i) => {
    const timestampRaw = m[1];
    const bodyStart = m.index! + m[0].length;
    const bodyEnd =
      i + 1 < matches.length ? matches[i + 1].index! : value.length;
    const body = value.slice(bodyStart, bodyEnd).trim();

    // "{actorName}: {text}" — author is everything up to the first colon,
    // if that looks like a name rather than note prose.
    let author: string | null = null;
    let text = body;
    const colon = body.indexOf(":");
    if (colon > 0 && colon <= 60 && !body.slice(0, colon).includes("\n")) {
      author = body.slice(0, colon).trim();
      text = body.slice(colon + 1).trim();
    }

    entries.push({
      timestampRaw,
      date: parseCrmDate(timestampRaw),
      author,
      text,
    });
  });

  return entries;
}

/** Newest first for display; undated legacy content sinks to the end. */
export function notesNewestFirst(entries: NoteEntry[]): NoteEntry[] {
  return [...entries].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.getTime() - a.date.getTime();
  });
}
