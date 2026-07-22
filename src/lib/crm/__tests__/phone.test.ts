import { describe, expect, it } from "vitest";
import { phoneHref } from "../phone";

describe("phoneHref — the six live formats (§9.1)", () => {
  it("bare number missing its leading 0", () => {
    expect(phoneHref("21721560")).toBe("tel:+6421721560");
  });

  it("domestic with spaces", () => {
    expect(phoneHref("0274 471 988")).toBe("tel:+64274471988");
  });

  it("international with space", () => {
    expect(phoneHref("+64 272471230")).toBe("tel:+64272471230");
  });

  it("domestic with dashes", () => {
    expect(phoneHref("027-272-6680")).toBe("tel:+64272726680");
  });

  it("64-prefixed with the domestic 0 mistakenly kept", () => {
    expect(phoneHref("640274332406")).toBe("tel:+64274332406");
  });

  it("landline", () => {
    expect(phoneHref("03 384 2210")).toBe("tel:+6433842210");
  });

  it("returns null for empty or unusable values", () => {
    expect(phoneHref("")).toBeNull();
    expect(phoneHref("   ")).toBeNull();
    expect(phoneHref("n/a")).toBeNull();
    expect(phoneHref("1234")).toBeNull();
  });
});
