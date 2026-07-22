import { describe, expect, it } from "vitest";
import {
  formatMinutes,
  OUTLIER_THRESHOLD_MINUTES,
  speedToLeadStats,
} from "../speed-to-lead";

describe("speedToLeadStats (§9.3)", () => {
  it("uses the median, not the mean", () => {
    const { medianMinutes } = speedToLeadStats([10, 20, 10000]);
    expect(medianMinutes).toBe(20);
  });

  it("averages the middle pair for an even count", () => {
    expect(speedToLeadStats([10, 20, 30, 40]).medianMinutes).toBe(25);
  });

  it("excludes outliers over 14 days and counts them", () => {
    const stats = speedToLeadStats([45, 88, 306447, null]);
    expect(stats.medianMinutes).toBe(66.5);
    expect(stats.excludedCount).toBe(1);
    expect(stats.sampleSize).toBe(2);
  });

  it("keeps a value exactly at the threshold", () => {
    const stats = speedToLeadStats([OUTLIER_THRESHOLD_MINUTES]);
    expect(stats.excludedCount).toBe(0);
    expect(stats.sampleSize).toBe(1);
  });

  it("ignores nulls and negatives, handles an empty sample", () => {
    expect(speedToLeadStats([null, -5]).medianMinutes).toBeNull();
    expect(speedToLeadStats([]).sampleSize).toBe(0);
  });
});

describe("formatMinutes", () => {
  it("renders minutes, hours and days", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(125)).toBe("2 h 5 min");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatMinutes(4320)).toBe("3.0 days");
  });
});
