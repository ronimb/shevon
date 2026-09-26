# Kickoff — `p2-edit` (STAT Ins / Del-A / DEL-deletes-line)

Copy everything below the line into a **new agent chat**. Only after
sanity on landed COMP/STAT/EQN is green. Do not start Dist, stay-in-STAT,
EQN 1/2/4, or packaging in that chat.

---

Follow `docs/principles.md`. Sources: `roadmap.md` Phase 2 `p2-edit`,
`issues.md` `stat-del`, `docs/coverage.md` STAT editor, manual **E-23**.
Update those files in the same change. Refresh canvases if the Phase 2
story changed. After the slice, run
[`sanity-landed.md`](sanity-landed.md).

You are implementing **STAT Edit only**: DEL deletes a data line, Ins
inserts a line, Del-A clears all data. Match the E-23 figure (element +
behavior). Do not invent a menu that the hardware does not show.

## Must do

1. In the STAT editor, DEL deletes the **current row**, not one digit of
   the cell. `applyStatDelete` in `src/modes/stat.tsx` currently slices
   the field string — replace that with hardware line-delete (and keep a
   legal empty/zero row so the editor does not vanish).
2. Ins inserts a blank row at the caret (SHIFT DEL / INS on the unit).
   Respect FREQ row caps (80 / 40 / 26).
3. Del-A deletes all sample data (hardware Edit → Del-A). Put the command
   where the hardware puts it (STAT Edit menu), not as a hidden COMP
   key. After Del-A the editor is empty in the hardware sense (one blank
   row is fine if that is what E-23 shows).
4. Tests in `src/manual.golden.test.ts` (and STAT helpers) cover
   line-delete, Ins, Del-A, and the cap.

## Do not

- Implement Dist (`p2-dist`) or stay-in-STAT (`p2-stat-mode`).
- Change COMP DEL / template-stem delete.
- Start EQN 1/2/4, LineIO, or packaging.
- Light STAT ▲▼ unless it falls out of the editor work with no extra
  scope (`ind-arrows` stays `vis-indicators`).

## Files

- `src/modes/stat.tsx` — `applyStatDelete`, Ins, Del-A, any Edit screen
- `src/modeRouter.ts` — DEL / SHIFT DEL / Edit menu routing
- `src/lcd.tsx` — Edit menu paint if the hardware shows one
- `src/manual.golden.test.ts` — editor behavior

## Done when

- Browser: MODE 3 → type → editor; DEL removes the line; Ins adds a
  row; Del-A clears the table.
- Existing tests still pass; new tests cover the three edits.
- `issues.md` `stat-del` checked only if all three land.
- `roadmap.md` `p2-edit` checked only if the whole slice is in.
