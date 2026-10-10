// Builds the sample daily plan in sample/daily_plan.json and prints its explanation.
// Run with: npm run example
import { readFileSync } from "node:fs";
import { buildDailyPlan, explainPlan, rationVersion, TenantContext } from "../index.js";

interface SamplePlan {
  tenant_id: string;
  site_id: string;
  feeding_group_id: string;
  feeding_date: string;
  head_count: number;
  feeding_rate: number;
  ration: { ration_id: string; version: number; ration_per_head: number; mix_portion: number };
}

const sample = JSON.parse(
  readFileSync(new URL("../../sample/daily_plan.json", import.meta.url), "utf8"),
) as SamplePlan;

const plan = buildDailyPlan(new TenantContext(sample.tenant_id), {
  siteId: sample.site_id,
  feedingGroupId: sample.feeding_group_id,
  feedingDate: sample.feeding_date,
  headCount: sample.head_count,
  feedingRate: sample.feeding_rate,
  ration: rationVersion({
    tenantId: sample.tenant_id,
    rationId: sample.ration.ration_id,
    version: sample.ration.version,
    rationPerHead: sample.ration.ration_per_head,
    mixPortion: sample.ration.mix_portion,
  }),
});

console.log(explainPlan(plan));
