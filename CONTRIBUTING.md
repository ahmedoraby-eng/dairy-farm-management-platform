# Contributing

Thanks for helping improve the platform. This page explains how changes move from idea to `main`.

## Workflow

1. **Start from an issue.** Describe the problem and acceptance criteria before writing code. Small fixes can skip this.
2. **Branch from `main`.** Name branches `feat/…`, `fix/…`, `docs/…` or `chore/…`.
3. **Keep pull requests small.** One concern per PR; aim for something a reviewer can read in 15 minutes.
4. **Fill in the PR template**, including how you tested and how to roll back.
5. **Get one approving review and a green CI run** before merging. Squash-merge with a clear title.

## Local checks

These are the same gates CI runs:

```bash
pip install -r requirements-dev.txt
ruff check . && ruff format --check . && pytest --cov=dairy_platform --cov-fail-under=90
```

## Engineering standards

- **Domain logic stays pure.** Calculations in `feed_management` are deterministic and free of I/O, so they stay easy to test.
- **Tenant safety first.** Anything tenant-scoped carries a `tenant_id` and is checked with `TenantContext.ensure_owns` before use. Add a cross-tenant test for every new aggregate.
- **Configuration over code.** Farm-specific values (rations, rates, thresholds) are configuration, never constants.
- **Record significant decisions** as an ADR in `docs/adr/` (context, decision, consequences).
- **Tests describe behaviour.** Name tests after the rule they protect, e.g. `test_cannot_use_another_tenants_ration`.

## Commit messages

Use the imperative mood and explain *why* when it isn't obvious:

```text
Add stock threshold alerts per site

Thresholds were global, so small sites alerted constantly.
```

## AI-assisted contributions

AI tools are welcome. The author stays accountable: read and understand every generated line, cover it with tests, never paste secrets or customer data into a prompt, and tick the AI box in the PR template.
