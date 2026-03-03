# CLAUDE.md
# Claude Self-Update Protocol — ENTERPRISE DOCTRINE

> Classification: Internal AI Governance
> Authority Level: CRITICAL
> Applies To: Claude (All Execution Contexts)
> Status: Living Document

---

# 1. PURPOSE

This document defines the mandatory self-update protocol for Claude.

Claude must continuously evolve its operational knowledge to prevent:

- Repeated mistakes
- Architectural drift
- Preference violations
- Context regression
- Knowledge inconsistency

This is not documentation.
This is operational memory discipline.

Principle:
SYSTEM > MEMORY

If it is not written here, it does not exist.

---

# 2. CORE DOCTRINE

Claude must update this file whenever durable knowledge is discovered.

Failure to update constitutes:
- Governance breach
- Pattern instability
- Future error risk

Claude is not reactive.
Claude is self-correcting.

---

# 3. UPDATE TRIGGERS

## 3.1 Explicit Triggers (User-Initiated)

Claude MUST update when:

1. User corrects a mistake
   Example: "Do not use MySQL. We use PostgreSQL."

2. User expresses a durable preference
   Example: "Use service layer, not fat controllers."

3. A better pattern is discovered during implementation

4. A gotcha or edge case is identified that could cause future errors

---

## 3.2 Implicit Triggers (Claude-Initiated)

Claude MUST update when:

1. Same mistake occurs twice
2. An assumption is invalidated
3. Architecture direction changes
4. Security rule is clarified
5. Tooling or environment changes
6. Pattern conflict is detected

Claude does NOT wait for user correction.

---

# 4. SEVERITY CLASSIFICATION

Every update must be classified.

🔴 CRITICAL
- Architecture
- Security
- Data integrity
- Core system design

🟡 STRUCTURAL
- Patterns
- Framework conventions
- Process rules

🔵 PREFERENCE
- Styling
- Naming
- Formatting
- Non-breaking decisions

Severity determines update priority and documentation placement.

---

# 5. MANDATORY UPDATE PROCEDURE

When a trigger occurs, Claude MUST:

1. Apply fix to the current task immediately
2. Update relevant section in this file
3. If rule-based → update DO / DON'T section
4. If architectural → update Architecture section
5. If new edge case → document under Gotchas
6. Assign severity level
7. Bump version number
8. Append to Changelog

No step may be skipped.

---

# 6. DOCUMENTATION STRUCTURE

All durable knowledge must belong to one of these sections:

- Architecture
- Standards
- DO / DON'T
- Preferences
- Security
- Gotchas
- Environment
- Tooling

No floating rules allowed.

---

# 7. RULE FORMATS

## 7.1 Rule Format

### Rule: [Rule Name]
Severity: [🔴/🟡/🔵]

Clear, direct instruction.

Example:

### Rule: Database Engine
Severity: 🔴 CRITICAL

We use PostgreSQL.
Never default to MySQL.

---

## 7.2 Preference Format

### Preference: [Preference Name]
Severity: 🔵 PREFERENCE

Clear stylistic or structural direction.

Example:

### Preference: Controller Pattern
Severity: 🔵 PREFERENCE

Use service layer instead of fat controllers.

---

## 7.3 Architecture Format

### Architecture: [Component Name]
Severity: 🔴 CRITICAL

Define structural or system-wide decisions.

Example:

### Architecture: UUID Strategy
Severity: 🔴 CRITICAL

All models use UUID as primary key.
UUID generation handled at application layer.

---

## 7.4 Gotcha Format

Use blockquote format:

> **Gotcha:** [Short description]
> Impact: [Why this matters]
> Prevention: [How to avoid]
> Severity: [Level]

Example:

> **Gotcha:** PostgreSQL `uuid-ossp` extension must be enabled before using `uuid_generate_v4()`.
> Impact: Migration failure.
> Prevention: Prefer application-level UUID generation.
> Severity: 🟡 STRUCTURAL

Gotchas must be precise and prevention-oriented.

---

# 8. DO / DON'T

## DO

- Record durable knowledge
- Record architectural decisions
- Record recurring mistakes
- Record security constraints
- Record edge cases with future impact
- Record environment-specific behavior

## DON'T

- Record one-off task decisions
- Record temporary experiments
- Record debugging logs
- Record emotional reactions
- Record obvious framework defaults
- Record ephemeral user moods

Rule:
When in doubt — record it.
Slight redundancy is cheaper than repeated failure.

---

# 9. WHAT NOT TO RECORD

Claude must NOT record:

- Task-specific hacks
- Temporary workarounds
- Framework documentation facts
- Non-repeatable conversation details
- Experimental branches not adopted

This document is for durable operational knowledge only.

---

# 10. GOVERNANCE HIERARCHY

If conflict occurs:

1. Explicit user instruction overrides this file
2. After override → this file MUST be updated
3. This file overrides conversational memory
4. This file is source of truth for repeat behavior

---

# 11. FAILURE MODES

Failure to update leads to:

- Pattern fragmentation
- Architectural inconsistency
- Preference violations
- Trust degradation
- Accumulated technical debt

Claude must self-correct immediately.

---

# 12. VERSIONING

Format: MAJOR.MINOR.PATCH

MAJOR → Structural doctrine change
MINOR → New rule added
PATCH → Clarification or wording fix

Example:

v1.0.0 – Initial doctrine
v1.1.0 – Added severity system
v1.2.0 – Added implicit triggers

Every durable change requires version bump.

---

# 13. CHANGELOG

## v1.0.0
- Initial Enterprise Doctrine established

---

# 14. CURRENT VERSION

Version: v1.0.0
Status: ACTIVE
Last Updated: [Initial Creation]

---

END OF FILE
