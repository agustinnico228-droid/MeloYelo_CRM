import { describe, expect, it } from "vitest";
import { notesNewestFirst, parseNotes } from "../notes";

describe("parseNotes — append-blob timeline (§9.7)", () => {
  it("returns nothing for an empty blob", () => {
    expect(parseNotes("")).toEqual([]);
    expect(parseNotes("   ")).toEqual([]);
  });

  it("splits multiple attributed entries", () => {
    const blob =
      "10:15am 08/07/26 Priya Patel: Called, keen on a test ride.\n" +
      "2:47pm 10/07/26 Priya Patel: Booked for Saturday.";
    const entries = parseNotes(blob);
    expect(entries).toHaveLength(2);
    expect(entries[0].author).toBe("Priya Patel");
    expect(entries[0].text).toBe("Called, keen on a test ride.");
    expect(entries[0].date).not.toBeNull();
    expect(entries[1].timestampRaw).toBe("2:47pm 10/07/26");
  });

  it("keeps legacy content with no timestamp as a single entry", () => {
    const entries = parseNotes("Prefers evening calls. Has a dog.");
    expect(entries).toHaveLength(1);
    expect(entries[0].timestampRaw).toBeNull();
    expect(entries[0].author).toBeNull();
    expect(entries[0].text).toBe("Prefers evening calls. Has a dog.");
  });

  it("keeps legacy content that precedes the first timestamped entry", () => {
    const entries = parseNotes(
      "Old free-text note.\n9:00am 01/07/26 Dave Thompson: Called.",
    );
    expect(entries).toHaveLength(2);
    expect(entries[0].timestampRaw).toBeNull();
    expect(entries[1].author).toBe("Dave Thompson");
  });

  it("treats an entry with no author colon as plain text", () => {
    const entries = parseNotes("9:00am 01/07/26 left a voicemail no answer");
    expect(entries).toHaveLength(1);
    expect(entries[0].author).toBeNull();
    expect(entries[0].text).toBe("left a voicemail no answer");
  });

  it("keeps multi-line note text within one entry", () => {
    const entries = parseNotes(
      "9:00am 01/07/26 Dave Thompson: First line.\nSecond line of the same note.",
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toContain("Second line");
  });
});

describe("notesNewestFirst", () => {
  it("sorts dated entries descending and sinks undated ones", () => {
    const entries = parseNotes(
      "Legacy scribble.\n" +
        "9:00am 01/07/26 Dave: older.\n" +
        "9:00am 15/07/26 Dave: newer.",
    );
    const sorted = notesNewestFirst(entries);
    expect(sorted[0].text).toBe("newer.");
    expect(sorted[1].text).toBe("older.");
    expect(sorted[2].timestampRaw).toBeNull();
  });
});
