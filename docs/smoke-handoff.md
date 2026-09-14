# Daily-driver smoke handoff

**Date:** 13–14 Sep 2026  
**Branch:** `main`  
**Purpose:** Continue classroom readiness from another machine. This file is the
smoke log + fix status. Scheduled work stays in [`roadmap.md`](../roadmap.md);
bugs stay in [`issues.md`](../issues.md).

## Goal (must-haves)

Flawless display and operation of:

- Simple calculations
- Trig + inverse
- Roots / nRoots
- Parentheses
- Memory (Ans + letter vars)
- Quadratic EQN
- SETUP for students: Deg, Rad, Norm, Sci (MthIO listed but still dishonest)
- log & ln
- Fractions
- No IR “under the hood” on the LCD (`sqrt`, `sin(`, `frac(`, …)

## How to pick up

```bash
git pull
npm install
npm run dev        # http://localhost:3000
npm run test       # goldens (expect green after the smoke-fix commit)
```

Read first: this file → [`issues.md`](../issues.md) (Memory + Display smoke ids)
→ [`roadmap.md`](../roadmap.md) **Now**.

---

## Round 1 — manual smoke (Ron, 13 Sep 2026)

### Results

| Id | Result | Notes |
|----|--------|-------|
| A1 | Partial | IR OK; superscript collided with root vinculum; x² vs x^y looked different |
| A2 | Ok | |
| A3 | Issue | Emulator auto-closed `sin(_)`; felt trapped |
| A4 | Same as A3 | ln |
| A5 | Ok | fractions |
| A6 | Ok | nRoot |
| A7 | Same as A3 | hyp |
| B1 | Ok | |
| B2 | Fail | Could not exit `sin` with arrows to continue `4×sin30×…` |
| B3 | Ok | parentheses |
| B4 | Ok | roots |
| B5 | Fail | `log(100)` → **Syntax ERROR** + closed-paren trap |
| B6 | Ok | fractions; same closed-paren note as A3 |
| C1–C3 | Ok | Deg / Rad / inverses |
| D1 | Ok | Sci |
| D2 | Unclear | Norm 1 vs 2 — see clarifications below |
| D3 | Unclear | MthIO — see clarifications |
| E1 | Ok | Ans |
| E2 | Fail | Recall → Math ERROR; wanted STO without prior `=` (`5→C` vs `Ans→C`) |
| E3–E4 | Skipped | blocked by E2 |
| F1 | Ok | quadratic; hardware does not show formula title above a/b/c |
| F2 | Fail | no real roots showed bare **Error** |
| F3 | Expected | EQN 1/2/4 do not proceed (menu fallthrough) |
| G1 | Ok | ◀▶ |
| G2 | Fail | ▲ showed **0** |

### Clarifications (not bugs)

- **D2 Norm:** SETUP → 8 → `1` or `2`. Norm1 switches to sci below ~`1e-2`;
  Norm2 waits until ~`1e-9`. Try `0.001=` under each.
- **D3 MthIO / LineIO:** SETUP 1/2 is still a no-op (`lineio-display` /
  `comp-lineio`). Always Natural/Math today — skip for daily use.
- **F3:** Lying EQN types 1/2/4 until `p2-eqn-linear` / `p2-eqn-cubic`.

---

## Fixes landed (after Round 1)

Code + docs in the same commit as this file. Issue ids in
[`issues.md`](../issues.md).

| Smoke | Issue id | Fix |
|-------|----------|-----|
| B5 | `log10-implicit-mul` | Implicit `digit(` multiply no longer rewrites `__log10(100)` → `__log10*(100)` |
| B2 / A3 | `trig-open-trap` | sin/cos/tan(+inverses) insert `sin(‸)` so →/↓ can leave the slot |
| E2 | `mem-abc-nan` | `calculateStatVars(null)` returns `{}` — no longer NaN-clobbers A/B/C |
| A1 collide | `root-sup-collision` | CSS: root-body padding + lower `.root-body .sup` (re-check visually) |
| A1 x² vs x^y | `x2-vs-xy-visual` | unicode `²`/`³` paint via same `.sup` as `^(2)` |
| F2 | (eqn) | “No real solutions” label; blank value instead of bare `Error` |
| F1 | (eqn) | Removed `aX²+bX+c=0` title above a/b/c grid |
| G2 | (Calculator) | ▲ history replay also from blank live line, not only while result showing |

Also: STO typed-operand path uses user `vars` + fixed STAT overlay; cursor pats
include `log10(` / `ln(` / inverses.

**Tests:** goldens for log10, RCL A with null STAT, EQN no-real, x² display —
suite was green locally (67 in the smoke-blocker pass).

---

## Round 2 — re-smoke on the other machine (do this first)

Mark pass/fail. Fail = wrong value, Math/Syntax ERROR when hardware wouldn’t,
or IR stem visible on LCD.

| # | Steps | Expect | ☐ |
|---|--------|--------|---|
| 1 | `log` `100` `=` | `2` | |
| 2 | `4` `×` `sin` `30` → → `×` `(` `30` `+` `10` `×` `3` `)` `=` | `120` | |
| 3 | `5` → SHIFT RCL (STO) → **A** | LCD `5→A`; then RCL A `=` → `5` | |
| 4 | Same for **B** and **C** | Recall works (was Math ERROR) | |
| 5 | `5` `=` → STO **C** | `Ans→C` | |
| 6 | Open √, nest x^y `2-2` (unclosed) | Radical + superscript; **no** `sqrt`; exponent under bar | |
| 7 | `5` x² vs `5` x^y `2` | Same superscript look | |
| 8 | EQN type 3; `a=1,b=0,c=1` `=` | “No real solutions”; **not** bare Error | |
| 9 | EQN type 3; `a=1,b=-5,c=6` | X1=3, X2=2; no formula title above grid | |
| 10 | Simple calc `=` then ▲ | Previous expression (not `0`) | |
| 11 | `ln` / hyp: type arg, → out, continue | Can leave template | |

If E2/E3 still fail after pull, file under `sto-without-equals` /
`mem-abc-nan` in `issues.md`.

---

## Still open (do not block Round 2 unless they fail again)

| Item | Notes |
|------|--------|
| `root-sup-collision` | CSS tweaked — confirm A1 nesting visually |
| `sto-without-equals` | Confirm `5` STO letter without prior `=` |
| `lineio-display` | MthIO/LineIO lie — policy: fix with `comp-lineio` |
| `eqn-menu-fallthrough` | Types 1/2/4 — Phase 2 |
| Complex quadratic roots | Still “No real solutions” |
| `err-jump` | ERROR ◀▶ jump-to-token deferred |
| Phase 2 SOLVE / STAT polish | After daily-driver bar |

## Out of scope for this week’s bar

Phase 3 modes, Current history pane, surd/π exact results (`p4-exact`),
packaging (`p4-packaging`).
