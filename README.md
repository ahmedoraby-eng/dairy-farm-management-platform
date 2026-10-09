# Dairy Farm Management Platform

[![CI](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/python-3.10%E2%80%933.13-blue)
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

This is implemented as deterministic, side-effect-free domain logic in `src/dairy_platform/feed_management/calculator.py`. Farm-specific operational policies (for example leftover-based adjustments) are modelled as configuration and policies, not hard-coded into the calculator.

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

## Repository structure

```text
src/dairy_platform/
  tenancy.py                 # Tenant context and isolation guard
  feed_management/
    calculator.py            # Core feeding calculation chain
    plan.py                  # Traceable, tenant-scoped daily feeding plan

tests/
  test_calculator.py
  test_plan.py

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
```

## Getting started

Requires Python 3.10+.

```bash
pip install -r requirements-dev.txt
python -m pytest
```

Run the example calculation:

```bash
python src/dairy_platform/feed_management/calculator.py
```

## Quality gates

Every push and pull request runs [CI](.github/workflows/ci.yml):

| Gate | Tool | Bar |
|---|---|---|
| Lint | `ruff check` (errors, imports, bug-prone patterns, modern syntax) | No findings |
| Formatting | `ruff format --check` | Consistent formatting |
| Tests | `pytest` on Python 3.10–3.13 | All pass |
| Coverage | `pytest-cov` | ≥ 90% of `dairy_platform` |

Run the same checks locally:

```bash
ruff check . && ruff format --check . && pytest --cov=dairy_platform
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md). In short: Feed Management, then Inventory & Stock, Herd integration, Reporting, a tenant admin portal, and analytics and optimisation where they are justified.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch, review and testing workflow. Pull requests use the [PR template](.github/pull_request_template.md).

## License

MIT
