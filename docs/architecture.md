# Architecture

## Scope

Target architecture for a multi-tenant dairy farm management platform. Feed Management is the first module. The document is deliberately technology-neutral where a choice has not yet been made.

## Logical architecture

```text
+--------------------------------------------------------------------+
|                         Client applications                        |
|      Web admin portal   |   Mobile (barn / feeding crew)   | API   |
+-----------------------------------+--------------------------------+
                                    |
                         API gateway / auth (tenant-aware)
                                    |
+-----------------------------------+--------------------------------+
|                     Dairy Farm Management Platform                 |
|                                                                    |
|  +----------------+  +----------------+  +----------------------+  |
|  | Feed           |  | Inventory &    |  | Reporting &          |  |
|  | Management     |  | Stock          |  | Analytics            |  |
|  +-------+--------+  +-------+--------+  +----------+-----------+  |
|          |                   |                      |              |
|  +-------+-------------------+----------------------+-----------+  |
|  |   Shared kernel: tenancy, configuration (versioned), audit   |  |
|  +-------------------------------+------------------------------+  |
+----------------------------------+---------------------------------+
                                   |
                  +----------------+----------------+
                  |                |                |
                  v                v                v
          Herd / veterinary   Milk recording    Finance / ERP
              adapter            adapter           adapter
```

## Design approach

- **Modular monolith first.** Modules share a deployment but own their data and talk through explicit interfaces. They can be split out later if scale or team ownership requires it.
- **Tenant-aware everywhere.** Every request resolves a tenant context at the edge (from the authenticated identity) and passes it to domain services. Domain code refuses data from another tenant.
- **Pure domain core.** Calculations are deterministic and free of I/O, so they are easy to test and to explain.
- **Adapters at the edge.** External systems (herd management, milk recording, finance) are reached through adapters that translate their formats into platform concepts.

```text
External herd report -> Herd adapter -> Daily head count -> Daily feeding plan
```

## Non-functional requirements

| Concern | Approach |
|---|---|
| Tenant isolation | Row-level `tenant_id` on every table, enforced in the data layer and covered by tests; optional dedicated database per tenant |
| Traceability | Daily plans store input snapshots and configuration versions |
| Availability | Feeding crews must work early in the morning; the mobile client should cache the day's plan for offline use |
| Auditability | Configuration changes are versioned with who/when/why |
| Security | Per-tenant roles (owner, farm manager, nutritionist, feeding crew, viewer) |
| Observability | Structured logs, metrics and traces tagged with tenant and site |
| Data residency | Region selectable per tenant when required |

## Evolution path

1. Feed Management: replace spreadsheet calculations
2. Controlled daily plans and approvals
3. Inventory and stock visibility (days of cover, alerts)
4. Automated herd data integration
5. Reporting across sites and tenants
6. Analytics and optimisation where they are justified
