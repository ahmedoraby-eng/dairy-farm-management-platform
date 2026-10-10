import { ValidationError } from "../errors.js";
import type { TenantContext } from "../tenancy.js";
import { calculateDailyFeeding, type FeedingResult } from "./calculator.js";

/**
 * A versioned ration configuration owned by a tenant.
 *
 * Plans reference the exact version they used, so editing a ration later
 * never changes the explanation of a past plan.
 */
export interface RationVersion {
  readonly tenantId: string;
  readonly rationId: string;
  readonly version: number;
  readonly rationPerHead: number;
  readonly mixPortion: number;
}

export function rationVersion(ration: RationVersion): RationVersion {
  if (!Number.isInteger(ration.version) || ration.version < 1) {
    throw new ValidationError("version must be a whole number, 1 or greater");
  }
  return Object.freeze({ ...ration });
}

/** A dated, tenant-scoped and fully traceable feeding plan. */
export interface DailyFeedingPlan {
  readonly tenantId: string;
  readonly siteId: string;
  readonly feedingGroupId: string;
  /** Calendar date in ISO 8601 form, e.g. 2026-10-01. */
  readonly feedingDate: string;
  readonly headCountSnapshot: number;
  readonly feedingRate: number;
  readonly rationId: string;
  readonly rationVersion: number;
  readonly result: FeedingResult;
}

export interface DailyPlanRequest {
  readonly siteId: string;
  readonly feedingGroupId: string;
  readonly feedingDate: string;
  readonly headCount: number;
  readonly feedingRate: number;
  readonly ration: RationVersion;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value: string): void {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (
    !ISO_DATE.test(value) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new ValidationError(`feedingDate must be a calendar date like 2026-10-01, got '${value}'`);
  }
}

/** Build a daily plan inside a tenant context, keeping every input used. */
export function buildDailyPlan(ctx: TenantContext, request: DailyPlanRequest): DailyFeedingPlan {
  const { ration } = request;
  ctx.ensureOwns(ration.tenantId, `ration '${ration.rationId}'`);
  assertIsoDate(request.feedingDate);

  const result = calculateDailyFeeding({
    headCount: request.headCount,
    feedingRate: request.feedingRate,
    rationPerHead: ration.rationPerHead,
    mixPortion: ration.mixPortion,
  });

  return Object.freeze({
    tenantId: ctx.tenantId,
    siteId: request.siteId,
    feedingGroupId: request.feedingGroupId,
    feedingDate: request.feedingDate,
    headCountSnapshot: request.headCount,
    feedingRate: request.feedingRate,
    rationId: ration.rationId,
    rationVersion: ration.version,
    result,
  });
}

/** Answers "why did the system calculate this quantity?" for a plan. */
export function explainPlan(plan: DailyFeedingPlan): string {
  const r = plan.result;
  return (
    `${plan.feedingDate} ${plan.siteId}/${plan.feedingGroupId}: ` +
    `${plan.headCountSnapshot} head x rate ${plan.feedingRate} = ${r.feedUnits} feed units; ` +
    `x ration ${plan.rationId} v${plan.rationVersion} = ${r.dailyNetRequirement}; ` +
    `mixer load ${r.mixerLoad}`
  );
}
