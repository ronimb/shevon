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
          (refreshed 25 Sep 2026).
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="38/76" label="Coverage done" tone="warning" />
        <Stat value="3 / 8" label="Modes with real logic" />
        <Stat value="AST" label="Engine (no new Function)" tone="success" />
        <Stat value="108" label="Tests (after p2-edit)" tone="success" />
      </Grid>

      <Callout tone="success" title="Phase 1 landed · Phase 2 in progress">
        COMP/SETUP and SOLVE are in the tree. STAT FREQ and EQN quadratic
        (real + a+bi) landed. Engine debt A–C landed (source-map, shell
        split, CalcValue). STAT Edit landed. Now: sanity, then p2-calc
        (E-19 CALC), and the other Phase 2 leftovers, then packaging.
        Phase 3 stays gated.
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
          complete mode. EQN solves quadratics (real and a+bi). CMPLX,
          BASE-N, MATRIX, TABLE, VECTOR, CONST, and CONV are menu chrome only.
        </Text>
      </Stack>

      <UsageBar
        total={800}
        topLeftLabel="Mode completeness (weighted 0–100 per Casio mode · source: docs/coverage.md)"
        topRightLabel="COMP + STAT + SETUP carry almost all of the working product"
        segments={[
          { id: "COMP", value: 85, color: "green" },
          { id: "STAT", value: 75, color: "blue" },
          { id: "EQN", value: 45, color: "yellow" },
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
            "UI compose",
            "Overlay, history pane, Current-keys strip. Handlers live in modeRouter (~490 lines).",
          ],
          [
            "src/lcd.tsx, keyboard.ts, useCalculatorState.ts, modeRouter.ts",
            "Shell (debt-shell)",
            "LCD + annunciators; PC keys; one store; COMP/STAT/EQN/SETUP/CLR",
          ],
          [
            "src/parser.ts + src/evaluator.ts",
            "Expression engine",
            "Typed AST; IR rewrite is source-mapped; result is CalcValue (real | complex | pair)",
          ],
          [
            "src/display.tsx, format.ts, keys.ts, types.ts, modes/",
            "Display, formats, key maps, types, modes",
            "Shared paintTemplates table; Fix/Sci/ENG/DMS; COMP / STAT / EQN helpers",
          ],
          [
            "src/historyKeys.tsx + historyOps.ts",
            "Current history",
            "Physical-key chips and live/non-calc sequences (landed extra)",
          ],
          [
            "src/index.css",
            "LCD + key chrome",
            "Natural-display templates, hitbox geometry, mini-key history glyphs",
          ],
          [
            "README.md + markdown plan",
            "Docs",
            "roadmap.md scheduled work · issues.md bugs · backlog.md unassigned ideas",
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
                Cursor walks templates. DEL is atomic on function stems. IR
                stems never leak onto the LCD.
              </Text>
              <Text tone="secondary">
                Ans, A–F / X / Y, independent M, STO/RCL, S⇔D (exact p/q
                only), DEG/RAD/GRA, Fix/Sci/Norm, ENG, DMS, Rnd, Ran#/RanInt#,
                CALC (partial — `p2-calc`), SOLVE (initial X, L−R, Continue, Variable ERROR /
                Can’t Solve), percent, nPr/nCr,
                Pol/Rec, π and e, SHIFT 9 CLR.
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
                and a+bi roots. Live Current keys strip plus History pane
                with physical-key Show Keys. PC keyboard maps Enter, arrows,
                Shift, Alt, and X/Y.
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
        rowTone={["warning", "warning", "warning"]}
        rows={[
          [
            "lying-menus",
            "MODE 2/4/6/7/8 listed, then silently return to COMP",
            "vis-menus · Phase 3",
          ],
          [
            "calc-ux / dist-empty / stat-jump-comp",
            "CALC ≠ E-19; Dist empty; recall → COMP",
            "Phase 2",
          ],
          [
            "ind-*",
            "STAT ▲▼ and Disp still dim; CMPLX/MAT/VCT wait on Phase 3",
            "vis-indicators",
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
            "Sanity on landed COMP/STAT/EQN/SOLVE",
            "npm test, lint, browser smoke (jump, Pol/Rec pair, SOLVE)",
            "docs/prompts/sanity-landed.md",
          ],
          [
            "p2-calc",
            "Unshifted CALC vs E-19 (memory letters, previous value, recalc)",
            "docs/prompts/p2-calc.md",
          ],
          [
            "Then Dist, stay in STAT, linear/cubic EQN",
            "p2-dist → p2-stat-mode → p2-eqn-linear → p2-eqn-cubic",
            "docs/prompts/phase-2.md",
          ],
          [
            "Packaging (pulled forward)",
            "Pages / PWA / portable exe / icon — after Phase 2, before Phase 3",
            "p4-packaging",
          ],
        ]}
        striped
      />

      <H2>Emulator extras (not on the Casio)</H2>
      <Text>
        Side pane with calculation history, LaTeX copy, reconstructed key
        sequences, PC keyboard, PWA install copy, and Electron portable
        build. Live Current history is a top-of-page strip (landed). Remaining
        extra work is the A–F / M letter-shortcut audit.
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
            dispatch({
              type: "openFile",
              path: "canvases/tech-debt.canvas.tsx",
            })
          }
        >
          Tech-debt canvas
        </Pill>
        <Pill
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "docs/prompts/p2-calc.md",
            })
          }
        >
          p2-calc prompt
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
