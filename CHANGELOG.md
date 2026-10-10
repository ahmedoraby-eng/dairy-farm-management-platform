# Changelog

Notable changes to the platform, newest first. Each entry links to the pull request that made it.

## Unreleased

### Changed
- **The platform is now TypeScript on Node.js 22 LTS** ([ADR-004](docs/adr/004-language-and-stack.md), [#3](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/pull/3)). The feed management and tenancy logic was ported with the same rules and error messages, and now also rejects non-finite quantities, fractional ration versions and invalid feeding dates.
- CI moved to the playbook's reusable Node workflow: strict typecheck, ESLint, Prettier, build, Vitest with a 90% gate on lines, branches, functions and statements, and an audit of production dependencies.

### Added
- ADR-004: language and stack, with the exceptions that need their own ADR (Python for analytics/ML, Go for high-concurrency ingestion, .NET when a client requires it).
- `npm run example` builds the sample daily plan and prints its explanation.

### Removed
- The Python package, its tests and Python tooling.

## 2026-10-10

### Changed
- CI now comes from the shared [engineering playbook](https://github.com/ahmedoraby-eng/engineering-playbook): lint, formatting, tests on Python 3.10–3.13 and a 90% coverage gate, plus `ai-guard` on every pull request with a tenancy-aware policy ([#1](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/pull/1)).
- GitHub Actions moved to their Node 24 versions.

### Added
- Contributing guide, pull request template and issue templates.
- Feed management module: deterministic feeding calculation chain and traceable, tenant-scoped daily feeding plans.
- Tenancy primitives (`TenantContext`, `TenantIsolationError`) guarding every tenant-scoped aggregate.
- Architecture, domain model and roadmap docs, and ADRs for configuration over hard-coding, integration boundaries and the multi-tenancy model.
