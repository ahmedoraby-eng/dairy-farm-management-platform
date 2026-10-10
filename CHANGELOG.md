# Changelog

Notable changes to the platform, newest first. Each entry links to the pull request that made it.

## 2026-10-10

### Changed
- CI now comes from the shared [engineering playbook](https://github.com/ahmedoraby-eng/engineering-playbook): lint, formatting, tests on Python 3.10–3.13 and a 90% coverage gate, plus `ai-guard` on every pull request with a tenancy-aware policy ([#1](https://github.com/ahmedoraby-eng/dairy-farm-management-platform/pull/1)).
- GitHub Actions moved to their Node 24 versions.

### Added
- Contributing guide, pull request template and issue templates.
- Feed management module: deterministic feeding calculation chain and traceable, tenant-scoped daily feeding plans.
- Tenancy primitives (`TenantContext`, `TenantIsolationError`) guarding every tenant-scoped aggregate.
- Architecture, domain model and roadmap docs, and ADRs for configuration over hard-coding, integration boundaries and the multi-tenancy model.
