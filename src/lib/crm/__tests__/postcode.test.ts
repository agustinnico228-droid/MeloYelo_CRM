import { describe, expect, it } from "vitest";
import { isMalformedPostcode, normalizePostcode } from "../postcode";

describe("normalizePostcode (§9.2)", () => {
  it("preserves leading zeros", () => {
    expect(normalizePostcode("0110")).toBe("0110");
  });

  it("pads short numeric codes to 4 digits for comparison", () => {
    expect(normalizePostcode("110")).toBe("0110");
  });

  it("strips stray whitespace and punctuation", () => {
    expect(normalizePostcode(" 1010 ")).toBe("1010");
  });

  it("returns empty for blank input", () => {
    expect(normalizePostcode("")).toBe("");
    expect(normalizePostcode("  ")).toBe("");
  });
});

describe("isMalformedPostcode", () => {
  it("flags the live 5-digit artefact", () => {
    expect(isMalformedPostcode("07020")).toBe(true);
  });

  it("flags non-numeric values", () => {
    expect(isMalformedPostcode("10a0")).toBe(true);
  });

  it("does not flag blanks (that's 'missing', not 'malformed')", () => {
    expect(isMalformedPostcode("")).toBe(false);
  });

  it("accepts normal 4-digit codes with leading zeros", () => {
    expect(isMalformedPostcode("0110")).toBe(false);
    expect(isMalformedPostcode("8011")).toBe(false);
  });
});
