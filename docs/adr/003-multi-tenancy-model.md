# ADR-003: Multi-Tenancy Model

## Status

Accepted

## Context

The platform is offered as SaaS to multiple, independent farm organisations. Tenants must never see each other's data. Most tenants are small to medium and cost-sensitive; a few may require stronger isolation or a specific data region.

## Options considered

| Option | Isolation | Cost / ops | Notes |
|---|---|---|---|
| Shared app + shared DB, `tenant_id` per row | Logical | Lowest | Needs strict enforcement and tests |
| Shared app + schema per tenant | Stronger | Medium | Migrations scale with tenant count |
| Dedicated stack per tenant | Strongest | Highest | Suits large/regulated tenants only |

## Decision

Start with **shared application and shared database with row-level tenant isolation**:

- every tenant-scoped table and aggregate carries `tenant_id`
- the tenant context is resolved from the authenticated identity at the edge, never from user input
- domain services require a `TenantContext` and reject cross-tenant data (`TenantIsolationError`)
- database row-level security as a second line of defence

Keep a **dedicated database per tenant** available as a premium deployment option behind the same code.

## Consequences

- Low cost per tenant and simple operations at the start.
- Isolation depends on discipline. Automated tests must cover cross-tenant access for every new aggregate.
- Per-tenant backup/restore and data export need to be designed explicitly.
