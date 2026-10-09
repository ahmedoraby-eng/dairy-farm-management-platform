import pytest

from dairy_platform.feed_management import FeedingInput, calculate_daily_feeding


def test_calculates_core_daily_feeding_chain():
    result = calculate_daily_feeding(
        FeedingInput(head_count=100, feeding_rate=1.0, ration_per_head=20.0, mix_portion=0.50)
    )

    assert result.feed_units == 100
    assert result.daily_net_requirement == 2000
    assert result.mixer_load == 1000


@pytest.mark.parametrize("field", ["head_count", "feeding_rate", "ration_per_head"])
def test_rejects_negative_inputs(field):
    base = dict(head_count=100, feeding_rate=1, ration_per_head=20, mix_portion=0.5)
    base[field] = -1

    with pytest.raises(ValueError):
        calculate_daily_feeding(FeedingInput(**base))


@pytest.mark.parametrize("mix_portion", [0, -0.1, 1.1])
def test_rejects_invalid_mix_portion(mix_portion):
    with pytest.raises(ValueError):
        calculate_daily_feeding(
            FeedingInput(head_count=100, feeding_rate=1, ration_per_head=20, mix_portion=mix_portion)
        )
