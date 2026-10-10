import { describe, expect, it } from "vitest";
import {
  buildDailyPlan,
  explainPlan,
  rationVersion,
  TenantContext,
  TenantIsolationError,
  ValidationError,
  type DailyPlanRequest,
} from "../src/index.js";

const ration = (tenantId = "tenant-a", version = 3) =>
  rationVersion({ tenantId, rationId: "lactating-high", version, rationPerHead: 20, mixPortion: 0.5 });

const request = (overrides: Partial<DailyPlanRequest> = {}): DailyPlanRequest => ({
  siteId: "site-1",
  feedingGroupId: "group-lactating",
  feedingDate: "2026-10-01",
  headCount: 100,
  feedingRate: 1,
  ration: ration(),
  ...overrides,
});

describe("buildDailyPlan", () => {
  it("keeps the inputs and ration version for traceability", () => {
    const plan = buildDailyPlan(new TenantContext("tenant-a"), request());

    expect(plan.tenantId).toBe("tenant-a");
    expect(plan.rationVersion).toBe(3);
    expect(plan.headCountSnapshot).toBe(100);
    expect(plan.result.mixerLoad).toBe(1000);
    expect(explainPlan(plan)).toBe(
      "2026-10-01 site-1/group-lactating: 100 head x rate 1 = 100 feed units; " +
        "x ration lactating-high v3 = 2000; mixer load 1000",
    );
  });

  it("cannot use another tenant's ration", () => {
    expect(() =>
      buildDailyPlan(new TenantContext("tenant-a"), request({ ration: ration("tenant-b") })),
    ).toThrow(TenantIsolationError);
  });

  it.each(["2026-13-01", "2026-02-30", "01/10/2026", ""])(
    "rejects an invalid feeding date (%s)",
    (feedingDate) => {
      expect(() => buildDailyPlan(new TenantContext("tenant-a"), request({ feedingDate }))).toThrow(
        ValidationError,
      );
    },
  );
});

describe("TenantContext", () => {
  it("requires a tenant id", () => {
    expect(() => new TenantContext(" ")).toThrow(ValidationError);
  });

  it("names the owning tenant when isolation is broken", () => {
    expect(() => {
      new TenantContext("tenant-a").ensureOwns("tenant-b");
    }).toThrow("resource belongs to tenant 'tenant-b', not 'tenant-a'");
  });
});

describe("rationVersion", () => {
  it.each([0, -1, 1.5])("rejects version %s", (version) => {
    expect(() => ration("tenant-a", version)).toThrow(ValidationError);
  });
});
