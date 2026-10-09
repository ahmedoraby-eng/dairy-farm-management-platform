from datetime import date

import pytest

from dairy_platform.feed_management import RationVersion, build_daily_plan
from dairy_platform.tenancy import TenantContext, TenantIsolationError


def _ration(tenant_id="tenant-a", version=3):
    return RationVersion(
        tenant_id=tenant_id,
        ration_id="lactating-high",
        version=version,
        ration_per_head=20.0,
        mix_portion=0.5,
    )


def test_plan_keeps_inputs_and_ration_version_for_traceability():
    plan = build_daily_plan(
        TenantContext("tenant-a"),
        site_id="site-1",
        feeding_group_id="group-lactating",
        feeding_date=date(2026, 10, 1),
        head_count=100,
        feeding_rate=1.0,
        ration=_ration(),
    )

    assert plan.tenant_id == "tenant-a"
    assert plan.ration_version == 3
    assert plan.head_count_snapshot == 100
    assert plan.result.mixer_load == 1000
    assert "lactating-high v3" in plan.explain()


def test_cannot_use_another_tenants_ration():
    with pytest.raises(TenantIsolationError):
        build_daily_plan(
            TenantContext("tenant-a"),
            site_id="site-1",
            feeding_group_id="group-1",
            feeding_date=date(2026, 10, 1),
            head_count=100,
            feeding_rate=1.0,
            ration=_ration(tenant_id="tenant-b"),
        )


def test_tenant_context_requires_an_id():
    with pytest.raises(ValueError):
        TenantContext(" ")


def test_ration_version_must_be_positive():
    with pytest.raises(ValueError):
        _ration(version=0)
