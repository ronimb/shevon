import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  UsageBar,
  useCanvasAction,
} from "cursor/canvas";

export default function ShevonStatus() {
  const dispatch = useCanvasAction();

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Shevon — project status</H1>
        <Text tone="secondary">
          Casio fx-991ES PLUS hardware overlay emulator. Behavior spec: the
          official user guide (`fx-570_991ES_PLUS_EN.pdf`). This canvas is a
          snapshot of `roadmap.md`, `issues.md`, and `docs/coverage.md`
          (refreshed 12 Sep 2026).
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="34/76" label="Coverage done" tone="warning" />
        <Stat value="3 / 8" label="Modes with real logic" />
        <Stat value="AST" label="Engine (no new Function)" tone="success" />
        <Stat value="56" label="Tests (40 golden + 16 parser)" tone="success" />
      </Grid>

      <Callout tone="success" title="Phase 1 landed · Phase 2 in progress">
        COMP/SETUP are honest for Fix/Sci/Norm, hyp, Ran#, ENG, DMS, Rnd,
        Gauss–Kronrod ∫, and CLR. STAT FREQ and the EQN quadratic editor
        (a/b/c, caret, bottom-left entry) have started Phase 2. Next:
        finish STAT and EQN before opening new modes.
      </Callout>

      <Stack gap={8}>
        <H2>What this project is</H2>
        <Text>
          A photoreal overlay of a Casio scientific calculator. Transparent
          hitboxes sit on `src/calculator_new.png`. The LCD is a custom
          Natural-V.P.A.M. renderer (HTML templates for fractions, roots,
          integrals, sums). The template language is lowered to a canonical
          form, parsed into a typed AST (`src/parser.ts`), and walked by the
          evaluator — no `new Function`, no code generation.
        </Text>
        <Text tone="secondary">
          COMP is usable for everyday scientific work. STAT is the next most
          complete mode. EQN only solves real quadratics. CMPLX, BASE-N,
          MATRIX, TABLE, VECTOR, CONST, and CONV are menu chrome only.
        </Text>
      </Stack>

      <UsageBar
        total={800}
        topLeftLabel="Mode completeness (weighted 0–100 per Casio mode · source: docs/coverage.md)"
        topRightLabel="COMP + STAT + SETUP carry almost all of the working product"
        segments={[
          { id: "COMP", value: 85, color: "green" },
          { id: "STAT", value: 75, color: "blue" },
          { id: "EQN", value: 35, color: "yellow" },
          { id: "SETUP", value: 75, color: "orange" },
          { id: "CMPLX", value: 2, color: "gray" },
          { id: "BASE-N", value: 2, color: "gray" },
          { id: "MATRIX", value: 2, color: "gray" },
          { id: "TABLE", value: 2, color: "gray" },
        ]}
      />

      <H2>Current architecture</H2>
      <Table
        headers={["Path", "Role", "Notes"]}
        columnAlign={["left", "left", "left"]}
        rows={[
          [
            "src/App.tsx",
            "Entry",
            "Thin re-export of Calculator.tsx after the Phase 0 split",
          ],
          [
            "src/Calculator.tsx",
            "UI shell",
            "COMP/STAT/EQN handlers, LCD, keys, history pane, keyboard, debug overlay — the remaining monolith",
          ],
          [
            "src/parser.ts + src/evaluator.ts",
            "Expression engine",
            "Tokenizer + recursive-descent AST parser; evaluator lowers the template IR and walks the AST",
          ],
          [
            "src/display.tsx, format.ts, keys.ts, types.ts, modes/",
            "Display, formats, key maps, types, modes",
            "formatMath / toLaTeX, Fix/Sci/ENG/DMS, PATS, COMP / STAT / EQN helpers",
          ],
          [
            "src/index.css",
            "LCD + key chrome",
            "Natural-display templates, hitbox geometry, mini-key history glyphs",
          ],
          [
            "src/calculator_new.png",
            "Hardware faceplate",
            "Committed under src/",
          ],
          [
            "electron-main.cjs",
            "Portable desktop shell",
            "480×850 window, loads Vite in dev and dist/index.html when packed",
          ],
          [
            "README.md + markdown plan",
            "Docs",
            "roadmap.md scheduled work · issues.md bugs · backlog.md unassigned ideas",
          ],
          [
            "fx-570_991ES_PLUS_EN.pdf",
            "Behavior spec",
            "Gitignored. Keep it local; do not commit.",
          ],
        ]}
        striped
        stickyHeader
      />

      <H2>What already works</H2>
      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>COMP</Pill>}>
            Scientific core
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                Natural-display input for fractions, mixed numbers, powers,
                roots, logs, trig, hyp, integrals, derivatives, and sums.
                Cursor walks templates. DEL is atomic on function stems.
              </Text>
              <Text tone="secondary">
                Ans, A–F / X / Y, independent M, STO/RCL, S⇔D, DEG/RAD/GRA,
                Fix/Sci/Norm, ENG, DMS, Rnd, Ran#/RanInt#, CALC prompts,
                SOLVE via Newton–Raphson, percent, nPr/nCr, Pol/Rec, π and e,
                SHIFT 9 CLR.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill size="sm" active>STAT / EQN</Pill>}>
            Mode work that landed
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                All eight STAT regression types, data editor with caret,
                FREQ ON/OFF and row caps, Sum / Var / MinMax / Reg recall,
                and estimated x̂ / ŷ in the evaluator.
              </Text>
              <Text tone="secondary">
                EQN quadratic a/b/c editor, caret, bottom-left entry, real
                roots. History pane can reload an expression and copy LaTeX.
                PC keyboard maps Enter, arrows, Shift, Alt, and letter
                shortcuts for X/Y.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Open issues (snapshot)</H2>
      <Text tone="secondary">
        Authoritative list is `issues.md`. Each row names the associated
        roadmap action.
      </Text>
      <Table
        headers={["Issue", "What’s wrong", "Associated"]}
        columnAlign={["left", "left", "left"]}
        rowTone={["warning", "warning", "warning", "info"]}
        rows={[
          [
            "lying-menus",
            "MODE 2/4/6/7/8 listed, then silently return to COMP",
            "vis-menus · Phase 3",
          ],
          [
            "stat-jump-comp / stat-del / dist-empty",
            "Recall jumps to COMP; DEL edits a cell; Dist submenu is empty",
            "Phase 2",
          ],
          [
            "err-jump / ascii-tokens / ind-*",
            "◀▶ does not jump to the fault token; remaining ASCII glyphs; dim indicators",
            "vis-errors · vis-no-literal · vis-indicators",
          ],
          [
            "Calculator.tsx is still a monolith",
            "Engine/modes extracted, but the UI shell still holds COMP/STAT/EQN, LCD, keys, and history",
            "backlog.md · Architecture",
          ],
        ]}
        striped
      />

      <H2>Next (from roadmap.md)</H2>
      <Table
        headers={["Next", "Detail", "Where"]}
        columnAlign={["left", "left", "left"]}
        rows={[
          [
            "Visual leftovers",
            "Disp/◀▶/▲▼ from real COMP state; error jump-to-token; remaining ASCII glyphs",
            "roadmap.md → Now",
          ],
          [
            "SOLVE UX, then rest of Phase 2",
            "p2-solve first; then Ins/Del-A, Dist, stay in STAT, linear/cubic EQN",
            "Phase 2",
          ],
          [
            "Current history",
            "Live key-order overlay — parked extra, not this slice",
            "roadmap.md → Emulator extras",
          ],
          [
            "Exact result forms / packaging",
            "n√m, p/q·π; Pages / PWA / exe",
            "Phase 4",
          ],
        ]}
        striped
      />

      <H2>Emulator extras (not on the Casio)</H2>
      <Text>
        Side pane with calculation history, LaTeX copy, reconstructed key
        sequences, PC keyboard, PWA install copy, Electron portable build,
        and a triple-click LCD calibration mode that lets you drag/resize
        hitboxes and copy CSS. Live Current history is a scheduled extra in
        `roadmap.md` (Emulator extras), not the current slice.
      </Text>

      <Divider />

      <H3>Working surfaces</H3>
      <Text tone="secondary">
        Open markdown beside the chat. Canvases are views of those files.
      </Text>
      <Row gap={8} wrap>
        <Pill
          active
          onClick={() => dispatch({ type: "openFile", path: "roadmap.md" })}
        >
          Roadmap
        </Pill>
        <Pill
          onClick={() => dispatch({ type: "openFile", path: "issues.md" })}
        >
          Issues
        </Pill>
        <Pill
          onClick={() => dispatch({ type: "openFile", path: "backlog.md" })}
        >
          Backlog
        </Pill>
        <Pill
          onClick={() =>
            dispatch({ type: "openFile", path: "docs/principles.md" })
          }
        >
          Principles
        </Pill>
        <Pill
          onClick={() =>
            dispatch({ type: "openFile", path: "docs/coverage.md" })
          }
        >
          Coverage
        </Pill>
        <Pill
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "canvases/casio-coverage.canvas.tsx",
            })
          }
        >
          Coverage canvas
        </Pill>
        <Pill
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "canvases/shevon-roadmap.canvas.tsx",
            })
          }
        >
          Roadmap canvas
        </Pill>
        <Pill
          onClick={() =>
            dispatch({ type: "openFile", path: "src/Calculator.tsx" })
          }
        >
          Open Calculator.tsx
        </Pill>
      </Row>
    </Stack>
  );
}
