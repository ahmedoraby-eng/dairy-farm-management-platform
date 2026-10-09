# Domain Model

## Core concepts

### Tenant
A customer organisation using the platform. Owns all of its farms, configuration and data. Nothing is shared between tenants.

### Farm
A farming business under a tenant. A tenant may operate one or many farms.

### Site
An operational location within a farm (barn, station, unit). Sites are added through configuration; the platform never assumes a fixed number.

### Feeding Group
A configurable grouping of pens that share a broadly similar feeding programme (for example lactating, dry, heifers, calves).

### Pen
A physical animal housing/grouping unit. Pen membership in a feeding group can change over time.

### Ration (versioned)
The configuration used to determine feeding quantities for a feeding group: ration per head and mix portion. Each change creates a new version, and a ration is never embedded directly in a pen record.

### Daily Feeding Plan
The dated operational plan produced from:

- head count snapshot
- feeding rate
- ration version
- mix configuration
- applicable operational adjustments

### Inventory
Tracks raw-material balances and consumption per site/warehouse; exposes current balance and days of cover.

## Relationships

```text
Tenant
  |
  +-- Farm
        |
        +-- Site
              |
              +-- Feeding Group --> Ration (versioned)
              |      |
              |      +-- Pen
              |            |
              |            +-- Animal population
              |
              +-- Daily Feeding Plan
              |
              +-- Inventory
```

## Traceability

A daily plan keeps enough information to explain its result later:

```text
Daily Plan
  +-- Tenant / Site / Feeding Group
  +-- Head Count Snapshot
  +-- Feeding Rate
  +-- Ration ID + Version
  +-- Resulting Requirement and Mixer Load
  +-- Operational Adjustments (with reason)
```

This avoids relying on today's configuration to reconstruct yesterday's decision.
