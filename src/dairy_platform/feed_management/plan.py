from dataclasses import dataclass
from datetime import date

from ..tenancy import TenantContext
from .calculator import FeedingInput, FeedingResult, calculate_daily_feeding


@dataclass(frozen=True)
class RationVersion:
    """A versioned ration configuration owned by a tenant.

    Plans reference the exact version they used, so editing a ration later
    never changes the explanation of a past plan.
    """

    tenant_id: str
    ration_id: str
    version: int
    ration_per_head: float
    mix_portion: float

    def __post_init__(self) -> None:
        if self.version < 1:
            raise ValueError("version must be 1 or greater")


@dataclass(frozen=True)
class DailyFeedingPlan:
    """A dated, tenant-scoped and fully traceable feeding plan."""

    tenant_id: str
    site_id: str
    feeding_group_id: str
    feeding_date: date
    head_count_snapshot: float
    feeding_rate: float
    ration_id: str
    ration_version: int
    result: FeedingResult

    def explain(self) -> str:
        r = self.result
        return (
            f"{self.feeding_date} {self.site_id}/{self.feeding_group_id}: "
            f"{self.head_count_snapshot:g} head x rate {self.feeding_rate:g} = {r.feed_units:g} feed units; "
            f"x ration {self.ration_id} v{self.ration_version} = {r.daily_net_requirement:g}; "
            f"mixer load {r.mixer_load:g}"
        )


def build_daily_plan(
    ctx: TenantContext,
    *,
    site_id: str,
    feeding_group_id: str,
    feeding_date: date,
    head_count: float,
    feeding_rate: float,
    ration: RationVersion,
) -> DailyFeedingPlan:
    """Build a daily plan inside a tenant context, keeping every input used."""
    ctx.ensure_owns(ration.tenant_id, what=f"ration '{ration.ration_id}'")

    result = calculate_daily_feeding(
        FeedingInput(
            head_count=head_count,
            feeding_rate=feeding_rate,
            ration_per_head=ration.ration_per_head,
            mix_portion=ration.mix_portion,
        )
    )
    return DailyFeedingPlan(
        tenant_id=ctx.tenant_id,
        site_id=site_id,
        feeding_group_id=feeding_group_id,
        feeding_date=feeding_date,
        head_count_snapshot=head_count,
        feeding_rate=feeding_rate,
        ration_id=ration.ration_id,
        ration_version=ration.version,
        result=result,
    )
