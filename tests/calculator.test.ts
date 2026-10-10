import { describe, expect, it } from "vitest";
import { calculateDailyFeeding, ValidationError, type FeedingInput } from "../src/index.js";

const base: FeedingInput = { headCount: 100, feedingRate: 1, rationPerHead: 20, mixPortion: 0.5 };

describe("calculateDailyFeeding", () => {
  it("calculates the core daily feeding chain", () => {
    const result = calculateDailyFeeding(base);

    expect(result).toEqual({ feedUnits: 100, dailyNetRequirement: 2000, mixerLoad: 1000 });
  });

  it.each(["headCount", "feedingRate", "rationPerHead"] as const)("rejects a negative %s", (field) => {
    expect(() => calculateDailyFeeding({ ...base, [field]: -1 })).toThrow(ValidationError);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])("rejects a non-finite head count (%s)", (headCount) => {
    expect(() => calculateDailyFeeding({ ...base, headCount })).toThrow(ValidationError);
  });

  it.each([0, -0.1, 1.1, Number.NaN])("rejects an invalid mix portion (%s)", (mixPortion) => {
    expect(() => calculateDailyFeeding({ ...base, mixPortion })).toThrow(
      "mixPortion must be greater than 0 and no greater than 1",
    );
  });

  it("accepts a full mix portion of 1", () => {
    expect(calculateDailyFeeding({ ...base, mixPortion: 1 }).mixerLoad).toBe(2000);
  });

  it("returns a result that cannot be changed afterwards", () => {
    expect(Object.isFrozen(calculateDailyFeeding(base))).toBe(true);
  });
});
