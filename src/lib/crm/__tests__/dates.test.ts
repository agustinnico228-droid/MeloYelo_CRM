import { describe, expect, it } from "vitest";
import { describeCrmDate, parseCrmDate, timeSince } from "../dates";

describe("parseCrmDate — mixed live formats (§9.4)", () => {
  it("parses dd/MM/yyyy HH:mm:ss", () => {
    const d = parseCrmDate("08/06/2026 19:56:21");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(5);
    expect(d!.getDate()).toBe(8);
    expect(d!.getHours()).toBe(19);
  });

  it("parses h:mma dd/MM/yy", () => {
    const d = parseCrmDate("2:47pm 26/10/25");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2025);
    expect(d!.getMonth()).toBe(9);
    expect(d!.getDate()).toBe(26);
    expect(d!.getHours()).toBe(14);
    expect(d!.getMinutes()).toBe(47);
  });

  it("parses 12am/12pm correctly", () => {
    expect(parseCrmDate("12:05am 01/01/26")!.getHours()).toBe(0);
    expect(parseCrmDate("12:05pm 01/01/26")!.getHours()).toBe(12);
  });

  it("parses a bare date", () => {
    const d = parseCrmDate("15/07/2026");
    expect(d).not.toBeNull();
    expect(d!.getHours()).toBe(0);
  });

  it("returns null for garbage instead of an invalid date", () => {
    expect(parseCrmDate("")).toBeNull();
    expect(parseCrmDate("yesterday")).toBeNull();
    expect(parseCrmDate("31/02/2026 10:00:00")).toBeNull();
    expect(parseCrmDate("2026-06-08")).toBeNull();
  });
});

describe("describeCrmDate", () => {
  it("never yields 'Invalid Date' — falls back to the raw string", () => {
    expect(describeCrmDate("not a date")).toBe("not a date");
    expect(describeCrmDate("08/06/2026 19:56:21")).not.toContain("Invalid");
  });
});

describe("timeSince", () => {
  const now = new Date(2026, 6, 22, 12, 0, 0);

  it("reports minutes, hours and days", () => {
    expect(timeSince("22/07/2026 11:30:00", now)).toBe("30 min");
    expect(timeSince("22/07/2026 07:00:00", now)).toBe("5 h");
    expect(timeSince("15/07/2026 12:00:00", now)).toBe("7 days");
  });

  it("returns null when the date can't be parsed", () => {
    expect(timeSince("garbage", now)).toBeNull();
  });
});
