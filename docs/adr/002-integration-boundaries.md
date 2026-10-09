# ADR-002: Keep External Systems Behind Integration Boundaries

## Status

Accepted

## Context

Dairy farms typically already run specialist systems for herd/veterinary records, milk recording and finance. Different tenants use different products. The platform must be useful without replacing them all.

## Decision

Use explicit integration boundaries (ports) with one adapter per external product.

Domain modules consume normalised business inputs (for example *daily head count per pen*), never vendor-specific formats.

## Consequences

This enables:

- onboarding tenants regardless of which herd or milk system they use
- incremental replacement where a tenant wants it
- independent evolution of external systems
- easier testing with fake adapters
- clearer ownership and reduced coupling

The first adapters can be file-based (CSV/Excel import). The domain stays ready for API-based integration.
