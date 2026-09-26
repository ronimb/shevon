# Kickoff — `shift-ac-mem` (SHIFT AC clears memory)

Copy everything below the line into a **new agent chat**. Emulator extra
only. Do not start `R17`, `p2-calc`, Dist, or Phase 3 in that chat.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Emulator extras
`shift-ac-mem`, `issues.md` `shift-ac-mem`. Hardware SHIFT AC is **OFF**
(roadmap **Out of scope** — do not emulate power-off). Today CLR
already clears memory: SHIFT 9 → 2. This slice adds SHIFT AC as a
shortcut with a visible indication.

## Must do

1. Overlay SHIFT then AC (and the same path from the PC keyboard if
   SHIFT is latched) clears A–F, X, Y, M, and Ans the same way
   SHIFT 9 → 2 Memory does. Do not wipe SETUP (angle, Fix/Sci, FREQ)
   unless you also run CLR All — default is Memory only.
2. LCD shows a short, honest indication (e.g. `CLR Memory` then return
   to COMP with a blank line / 0), not a fake OFF screen.
3. Unshifted AC stays as it is now (clear the line / overlays, keep
   memory).
4. Tests: SHIFT AC zeros a stored letter; unshifted AC does not.

## Do not

- Implement hardware OFF, contrast, or auto power-off.
- Start `R17`, `R27`, `p2-calc`, Dist, or packaging.
- Disable lying MODE/EQN rows.

## Files

- `src/modeRouter.ts` — `clearAll` when SHIFT is on
- `src/lcd.tsx` — brief indication if needed
- `src/manual.golden.test.ts`

## Done when

- Browser: STO 7 → A, SHIFT AC, RCL A → 0; LCD showed a clear
  indication.
- Unshifted AC after STO 7 → A still recalls 7.
- `issues.md` `shift-ac-mem` and `roadmap.md` extras checked only if
  the whole slice is in.
