# Dairy Farm Management Platform

[![CI](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-green)
![License](https://img.shields.io/badge/license-MIT-green)

An open, **multi-tenant SaaS foundation for running dairy farm operations**: feeding, inventory, herd data and the integrations that connect them.

The first module is **Feed Management**. It replaces spreadsheet-driven daily feeding calculations with configurable, traceable and testable domain logic. Further modules are added one at a time, behind clear integration boundaries.

> **Status:** early foundation / reference implementation. The domain model, core feeding calculation and tenancy primitives are implemented and tested. Persistence, API and UI layers are on the roadmap.

## Why this platform

Many dairy farms still run day-to-day operations on spreadsheets. Herd records, milk recording and finance each live in separate systems, and people re-key data between them. The result is:

- business rules hidden inside spreadsheet formulas
- no reliable history of *why* a daily plan had the numbers it had
- every new site or barn means copying and editing a workbook
- no single view across sites, stock and consumption

This platform separates **business rules, configuration, daily operational facts and calculated results**. Each farm (tenant) can configure its own operation without code changes.

## Platform at a glance

```text
                    +-------------------------------------------+
                    |      Dairy Farm Management Platform       |
                    |                                           |
  Tenant A  ----->  |  +-------------+  +-------------------+   |
  Tenant B  ----->  |  | Feed        |  | Inventory &       |   |
  Tenant C  ----->  |  | Management  |  | Stock             |   |
                    |  +-------------+  +-------------------+   |
                    |  +-------------+  +-------------------+   |
                    |  | Herd        |  | Reporting &       |   |
                    |  | (roadmap)   |  | Analytics         |   |
                    |  +-------------+  +-------------------+   |
                    |        Tenancy, configuration, audit      |
                    +----------------------+--------------------+
                                           |
              +----------------------------+---------------------------+
              v                            v                           v
     Herd / veterinary             Milk recording /             Finance / ERP
     system adapter                parlour adapter               adapter
```

## Domain model

```text
Tenant (customer organisation)
  |
  +-- Farm
        |
        +-- Site (barn / station / location)
              |
              +-- Feeding Group
              |     |
              |     +-- Pen
              |           |
              |           +-- Animal population (head count)
              |
              +-- Daily Feeding Plan
              |
              +-- Warehouse / Inventory
```

A key design decision is:

```text
Pen -> Feeding Group -> Ration (versioned)
```

instead of assigning a ration directly to a pen. Pens can move between groups, and rations can change, without code changes. Each daily plan keeps the ration version it used.

## Core feeding calculation

```text
Head Count            x Feeding Rate    = Feed Units
Feed Units            x Ration per Head = Daily Net Requirement
Daily Net Requirement x Mix Portion     = Mixer Load
```

This is implemented as deterministic, side-effect-free domain logic in `src/feed-management/calculator.ts`. Farm-specific operational policies (for example leftover-based adjustments) are modelled as configuration and policies, not hard-coded into the calculator.

## Multi-tenancy

- Every aggregate carries a `tenant_id`. A `TenantContext` is required to build plans, so data cannot cross tenant boundaries by accident.
- Configuration (sites, feeding groups, rations, feeding rates, mix portions, stock thresholds) is **per tenant and versioned**.
- Starting model: a shared application and database with row-level tenant isolation. A dedicated database per tenant stays available for customers that need it. See [ADR-003](docs/adr/003-multi-tenancy-model.md).

## Architecture principles

1. **Start from the As-Is.** Understand who does each step, what data really exists and which system is authoritative before designing the To-Be.
2. **Configuration over hard-coding.** Sites, groups, rations and thresholds are tenant configuration ([ADR-001](docs/adr/001-configuration-over-hard-coding.md)).
3. **Traceability.** Every daily plan can answer: *"Why did the system calculate this quantity?"*
4. **Clear integration boundaries.** Herd, milk and finance systems sit behind adapters ([ADR-002](docs/adr/002-integration-boundaries.md)).
5. **Incremental modernisation.** Replace the highest-value spreadsheet process first, then add modules one at a time.
6. **One typed stack.** TypeScript on Node.js across services and front ends, with exceptions only by ADR ([ADR-004](docs/adr/004-language-and-stack.md)).

## Repository structure

```text
src/
  errors.ts                  # ValidationError, TenantIsolationError
  tenancy.ts                 # Tenant context and isolation guard
  feed-management/
    calculator.ts            # Core feeding calculation chain
    plan.ts                  # Traceable, tenant-scoped daily feeding plan
  examples/
    daily-plan.ts            # Builds the sample plan and explains it

tests/
  calculator.test.ts
  plan.test.ts

sample/
  daily_plan.json

docs/
  architecture.md
  domain-model.md
  roadmap.md
  adr/
    001-configuration-over-hard-coding.md
    002-integration-boundaries.md
    003-multi-tenancy-model.md
    004-language-and-stack.md
```

## Getting started

Requires Node.js 22 LTS or later.

```bash
npm ci
npm test
```

Build the sample daily plan and print its explanation:

```bash
npm run example
# 2026-10-01 site-1/lactating-group: 100 head x rate 1 = 100 feed units; x ration lactating-standard v1 = 2000; mixer load 1000
```

## Quality gates

This repository adopts the shared standards from the [engineering playbook](https://github.com/ahmedoraby-eng/engineering-playbook) rather than maintaining its own copies. Every pull request runs:

| Gate | Source | Bar |
|---|---|---|
| Typecheck, lint, format, build | Playbook [reusable Node CI](https://github.com/ahmedoraby-eng/engineering-playbook/blob/main/.github/workflows/reusable-node-ci.yml) — `npm run check`: strict `tsc`, ESLint (`typescript-eslint` strict), Prettier | No findings |
| Tests and coverage | Same workflow — `npm run test:coverage` (Vitest) | All pass; ≥ 90% lines, branches, functions and statements |
| Dependency audit | Same workflow — `npm audit --omit=dev` | No high or critical issues |
| AI guardrails | Playbook [`ai-guard`](https://github.com/ahmedoraby-eng/engineering-playbook#ai-guard), tuned in [`.ai-guard.toml`](.ai-guard.toml) | AI assistance disclosed; tests with AI-written code; `human-reviewed` label for AI-assisted changes to tenancy or CI |

The local wiring is two short files: [`ci.yml`](.github/workflows/ci.yml) and [`ai-guard.yml`](.github/workflows/ai-guard.yml).

Run the same checks locally:

```bash
npm run check && npm run test:coverage
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md). In short: Feed Management, then Inventory & Stock, Herd integration, Reporting, a tenant admin portal, and analytics and optimisation where they are justified.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch, review and testing workflow. Pull requests use the [PR template](.github/pull_request_template.md).

## License

MIT
