import { ValidationError } from "../errors.js";

/**
 * Inputs for the core daily feed calculation.
 *
 * Units are tenant-configurable (e.g. kg dry matter per head); the
 * calculation itself is unit-agnostic.
 */
export interface FeedingInput {
  readonly headCount: number;
  readonly feedingRate: number;
  readonly rationPerHead: number;
  readonly mixPortion: number;
}

export interface FeedingResult {
  readonly feedUnits: number;
  readonly dailyNetRequirement: number;
  readonly mixerLoad: number;
}

const NON_NEGATIVE_FIELDS = ["headCount", "feedingRate", "rationPerHead"] as const;

/**
 * Core feeding chain.
 *
 *   head count x feeding rate              = feed units
 *   feed units x ration per head           = daily net requirement
 *   daily net requirement x mix portion    = mixer load
 */
export function calculateDailyFeeding(input: FeedingInput): FeedingResult {
  for (const field of NON_NEGATIVE_FIELDS) {
    const value = input[field];
    if (!Number.isFinite(value) || value < 0) {
      throw new ValidationError(`${field} must be a finite number and cannot be negative`);
    }
  }
  if (!(input.mixPortion > 0 && input.mixPortion <= 1)) {
    throw new ValidationError("mixPortion must be greater than 0 and no greater than 1");
  }

  const feedUnits = input.headCount * input.feedingRate;
  const dailyNetRequirement = feedUnits * input.rationPerHead;
  const mixerLoad = dailyNetRequirement * input.mixPortion;

  return Object.freeze({ feedUnits, dailyNetRequirement, mixerLoad });
}
