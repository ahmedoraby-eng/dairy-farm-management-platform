# ADR-004: Language and Stack

## Status

Accepted. Supersedes the initial Python reference implementation.

## Context

- **Most code is written by coding agents and reviewed by people.** Review effort, not typing speed, is the bottleneck. The stack must make a wrong change easy to spot and hard to merge.
- **Reviewers come from typed, enterprise backgrounds** (Java, .NET). Explicit types and compiler errors are what they read most quickly.
- **One language across the portfolio.** The school platform is already TypeScript on Node.js, and the web and mobile front ends will be TypeScript too. One language means one set of standards, one CI template, shared libraries and engineers who can move between products.
- **The workload is a multi-tenant SaaS API**: CRUD, validation, versioned configuration and integration adapters. It is I/O-bound, not CPU-bound.
- **Shared standards exist for Python and Node.js** in the engineering playbook, so either is cheap to enforce.

## Options considered

| Option | For | Against |
|---|---|---|
| **TypeScript on Node.js** | Strict types caught by the compiler; same language as the front ends and the school platform; agents write it well; large ecosystem; fast CI | Runtime and tooling choices to standardise (lint, test, build); weaker for heavy numeric work |
| Python | Fastest for analytics and ML; very readable | Types are optional and checked only by extra tools; a second language next to the TypeScript front ends |
| Java (Spring Boot) | Familiar to reviewers; mature for enterprise | Verbose diffs to review; slower feedback loop; a second language next to the front ends |
| .NET (C#) | Strong types and tooling; common in enterprise clients | Same second-language cost as Java |
| Go | Simple, fast, excellent for high-concurrency services | Thinner domain-modelling ecosystem; a second language for little gain at current scale |

## Decision

**TypeScript on Node.js (LTS) is the default stack** for services and front ends.

Standards, enforced by CI through the playbook's [reusable Node workflow](https://github.com/ahmedoraby-eng/engineering-playbook/blob/main/.github/workflows/reusable-node-ci.yml):

- `strict` TypeScript, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- ESLint with `typescript-eslint` strict type-checked rules, and Prettier
- Vitest with a 90% coverage gate on lines, branches, functions and statements
- `npm audit` of production dependencies; a committed `package-lock.json` and `npm ci`

### Exceptions, each by its own ADR

| Language | Only when |
|---|---|
| Python | Analytics or ML work (e.g. roadmap phase 6, optimisation), as a separate service behind an API |
| Go | High-concurrency ingestion, such as IoT sensor or parlour data streams, where Node.js measurably falls short |
| .NET | An enterprise client contractually requires it |

## Consequences

- One CI template, one set of standards and one hiring profile cover the platform end to end.
- Reviewers rely on the compiler and the lint rules; a change that breaks a type or a tenant check fails before review.
- Domain logic stays plain functions and immutable data, so it can move to another runtime if ever needed.
- Heavy numeric or ML work will need a second stack later; the exception rule keeps that deliberate.

## When to revisit

- A performance or concurrency need that Node.js cannot meet after profiling.
- A client or regulatory requirement for a specific stack.
- Analytics or ML becomes a core product capability rather than a supporting service.
