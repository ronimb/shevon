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
          Casio fx-570ES PLUS / fx-991ES PLUS hardware overlay emulator,
          moved from Google AI Studio into this Cursor workspace. Source of
          truth for behavior is the official 46-page user guide
          (`fx-570_991ES_PLUS_EN.pdf`).
        </Text>
      </Stack>

      <Callout tone="warning" title="Gemini transcript was not readable">
        The share link requires a Google sign-in wall, so this kickoff is
        based on the current repo plus the Casio manual — not the original
        Gemini chat. If you can export that transcript, we can fold its
        intent and leftover decisions into these canvases.
      </Callout>

      <Grid columns={4} gap={16}>
        <Stat value="~45%" label="Manual coverage" tone="warning" />
        <Stat value="3 / 8" label="Modes with real logic" />
        <Stat value="AST" label="Engine (no new Function)" tone="success" />
        <Stat value="22" label="Tests (6 golden + 16 parser)" tone="success" />
      </Grid>

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
        topLeftLabel="Mode completeness (weighted 0–100 per Casio mode)"
        topRightLabel="COMP + STAT carry almost all of the working product"
        segments={[
          { id: "COMP", value: 80, color: "green" },
          { id: "STAT", value: 70, color: "blue" },
          { id: "EQN", value: 25, color: "yellow" },
          { id: "SETUP", value: 20, color: "orange" },
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
            "COMP/STAT/EQN handlers, LCD, keys, history pane, keyboard, debug overlay",
          ],
          [
            "src/parser.ts + src/evaluator.ts",
            "Expression engine",
            "Tokenizer + recursive-descent AST parser; evaluator lowers the template IR and walks the AST (no new Function)",
          ],
          [
            "src/display.tsx, keys.ts, modes/",
            "Display, key maps, modes",
            "formatMath / toLaTeX, PATS / CURSOR_PATS, COMP / STAT / EQN helpers",
          ],
          [
            "src/index.css",
            "LCD + key chrome",
            "Natural-display templates, hitbox geometry, mini-key history glyphs",
          ],
          [
            "src/main.tsx",
            "React mount",
            "Thin entry",
          ],
          [
            "src/calculator_new.png",
            "Hardware faceplate",
            "Imported; not visible to workspace search — confirm it is committed",
          ],
          [
            "electron-main.cjs",
            "Portable desktop shell",
            "480×850 window, loads Vite in dev and dist/index.html when packed",
          ],
          [
            "vite.config.ts",
            "Build",
            "Still injects GEMINI_API_KEY from AI Studio",
          ],
          [
            "package.json",
            "Scripts + deps",
            "mathjs and @google/genai still installed but unused — engine uses a custom AST, not mathjs",
          ],
          [
            ".github/workflows/deploy.yml",
            "GitHub Pages",
            "Builds on push to main",
          ],
          [
            "README.md",
            "Docs",
            "Still the AI Studio boilerplate — not this calculator",
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
                roots, logs, trig, integrals, derivatives, and sums. Cursor
                walks templates. DEL is atomic on function stems.
              </Text>
              <Text tone="secondary">
                Ans, A–F / X / Y, independent M, STO/RCL, S⇔D
                fraction/decimal toggle, DEG/RAD/GRA, CALC prompts, SOLVE
                via Newton–Raphson, percent, nPr/nCr, Pol/Rec, π and e.
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
                All eight STAT regression types, data editor, Sum / Var /
                MinMax / Reg recall, and estimated x̂ / ŷ in the evaluator.
              </Text>
              <Text tone="secondary">
                EQN quadratic coefficient editor and real-root display.
                History pane can reload an expression and copy LaTeX. PC
                keyboard maps Enter, arrows, Shift, Alt, and a few letter
                shortcuts.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Callout tone="success" title="Resolved this pass">
        App.tsx split into evaluator / display / keys / modes; `new Function`
        replaced with a tokenizer + recursive-descent AST parser; golden tests
        from the manual plus parser unit tests (22 total) are green.
      </Callout>

      <H2>Structural risks</H2>
      <Table
        headers={["Risk", "Why it matters", "Severity"]}
        rowTone={["warning", "warning", "info"]}
        rows={[
          [
            "Unused mathjs / Gemini SDK",
            "Dead AI Studio leftovers; engine now uses a custom AST, so mathjs can be dropped outright",
            "Medium",
          ],
          [
            "Menu items that do nothing",
            "MODE 2/4/6/7/8 and SETUP Fix/Sci/Norm look real, then silently return to COMP",
            "Medium",
          ],
          [
            "Numeric methods not Casio-accurate",
            "∫ uses a fixed 100-step trapezoid and d/dx a one-sided difference; no exact/natural result forms yet",
            "Medium",
          ],
        ]}
        striped
      />

      <H2>Next steps</H2>
      <Table
        headers={["Next", "Detail", "Phase"]}
        columnAlign={["left", "left", "left"]}
        rows={[
          [
            "Clean AI Studio leftovers",
            "Remove @google/genai + mathjs, drop GEMINI_API_KEY from vite.config.ts, rewrite the README",
            "Phase 0",
          ],
          [
            "Make COMP / SETUP honest",
            "SETUP Fix/Sci/Norm, hyp menu, Ran#/RanInt, ENG, °′″, Rnd(, and Math/Syntax ERROR jumps",
            "Phase 1",
          ],
          [
            "Casio-accurate numeric methods",
            "Swap trapezoid ∫ for Gauss–Kronrod and d/dx for a central difference with tolerance",
            "Phase 1",
          ],
          [
            "Exact result forms",
            "Now that intermediate forms are inspectable, surface n√m, p/q·π, and mixed fractions",
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
        hitboxes and copy CSS.
      </Text>

      <Divider />

      <H3>Working surfaces</H3>
      <Text tone="secondary">
        Open these beside the chat. They are the living kickoff docs for
        this transition.
      </Text>
      <Row gap={8} wrap>
        <Pill
          active
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "canvases/casio-coverage.canvas.tsx",
            })
          }
        >
          Function coverage
        </Pill>
        <Pill
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "canvases/shevon-roadmap.canvas.tsx",
            })
          }
        >
          Roadmap and actions
        </Pill>
        <Pill
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "src/App.tsx",
            })
          }
        >
          Open App.tsx
        </Pill>
      </Row>
    </Stack>
  );
}
