from dataclasses import dataclass


@dataclass(frozen=True)
class FeedingInput:
    """Inputs for the core daily feed calculation.

    Units are tenant-configurable (e.g. kg dry matter per head); the
    calculation itself is unit-agnostic.
    """

    head_count: float
    feeding_rate: float
    ration_per_head: float
    mix_portion: float


@dataclass(frozen=True)
class FeedingResult:
    feed_units: float
    daily_net_requirement: float
    mixer_load: float


def calculate_daily_feeding(data: FeedingInput) -> FeedingResult:
    """Core feeding chain.

    head count x feeding rate              = feed units
    feed units x ration per head           = daily net requirement
    daily net requirement x mix portion    = mixer load
    """
    if data.head_count < 0:
        raise ValueError("head_count cannot be negative")
    if data.feeding_rate < 0:
        raise ValueError("feeding_rate cannot be negative")
    if data.ration_per_head < 0:
        raise ValueError("ration_per_head cannot be negative")
    if not 0 < data.mix_portion <= 1:
        raise ValueError("mix_portion must be greater than 0 and no greater than 1")

    feed_units = data.head_count * data.feeding_rate
    daily_net_requirement = feed_units * data.ration_per_head
    mixer_load = daily_net_requirement * data.mix_portion

    return FeedingResult(
        feed_units=feed_units,
        daily_net_requirement=daily_net_requirement,
        mixer_load=mixer_load,
    )


if __name__ == "__main__":
    example = FeedingInput(
        head_count=100,
        feeding_rate=1.0,
        ration_per_head=20.0,
        mix_portion=0.50,
    )
    print(calculate_daily_feeding(example))
