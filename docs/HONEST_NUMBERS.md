# Honest Numbers — Twin-Sparrow Claude Adapter

Date: 2026-07-06

## Current status

The adapter currently reports **local estimates only**.

It does **not** claim measured Claude token savings yet.

## What is estimated

For each emitted capsule bundle, the adapter records:

- `characterCount`
- `estimatedTokens`
- `estimateMethod: chars_div_4_rounded_up`
- `estimatesOnly: true`
- `claimedSavings: false`

These values are useful for local regression checks. They are not billing truth.

## What is not measured yet

The adapter does not yet measure:

- actual Claude input tokens
- actual Claude output tokens
- Claude cache reads/writes
- Claude reasoning-token behavior
- full-prompt baseline cost
- end-to-end savings against manual Twin-Sparrow prompt replay

## Claim boundary

Allowed claim:

> The adapter estimates capsule size locally and records those estimates in the ledger.

Not allowed yet:

> The adapter saves X% tokens.

Not allowed yet:

> The adapter is cheaper than full Twin-Sparrow prompt replay.

Those require live benchmark runs against a defined baseline.

## Required benchmark before savings claims

1. Define a full-prompt baseline.
2. Run representative Claude tasks with full prompt replay.
3. Run the same tasks with capsule injection.
4. Compare actual provider usage where available.
5. Track quality failures:
   - doctrine miss
   - source-grounding miss
   - skill-gate miss
   - companion continuity miss
   - user correction required

## Design rule

A capsule can be elegant and still be net-negative. If token-economics telemetry shows frequent net-negative turns, the capsule selector must become stricter.
