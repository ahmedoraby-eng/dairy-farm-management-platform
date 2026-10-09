# ADR-001: Configuration Over Hard-Coding

## Status

Accepted

## Context

Feeding groups, pen membership, rations, feeding rates, mix portions and stock thresholds differ between farms, and change over time within a farm. Embedding them in application logic would repeat the main weakness of spreadsheet-based operations: rules that only change by editing formulas.

## Decision

Represent operational variation as managed, **tenant-scoped, versioned configuration**.

The domain model distinguishes:

- business rules
- configuration
- daily operational facts
- calculated results

## Consequences

### Positive

- New tenants, farms and sites are onboarded without code changes.
- Pens can move between feeding groups.
- Ration changes do not require a deployment.
- Historical plans keep the configuration version used at the time.

### Trade-off

Configuration becomes a governed business capability. It needs validation, versioning, permissions and auditability as the product matures.
