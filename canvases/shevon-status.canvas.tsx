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
        <Stat value="~3,300" label="Lines in App.tsx" />
        <Stat value="0" label="Automated tests" tone="danger" />
      </Grid>

      <Stack gap={8}>
        <H2>What this project is</H2>
        <Text>
          A photoreal overlay of a Casio scientific calculator. Transparent
          hitboxes sit on `src/calculator_new.png`. The LCD is a custom
          Natural-V.P.A.M. renderer (HTML templates for fractions, roots,
          integrals, sums). Evaluation rewrites the internal expression into
          JavaScript and runs it with `new Function`.
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
            "Entire product",
            "Types, parser, STAT/EQN, LCD, keys, history pane, keyboard, debug overlay",
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
            "mathjs and @google/genai are installed but unused",
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

      <H2>Structural risks</H2>
      <Table
        headers={["Risk", "Why it matters", "Severity"]}
        rowTone={["danger", "warning", "warning", "warning", "info"]}
        rows={[
          [
            "new Function evaluation",
            "String-rewritten JS is hard to test, easy to get wrong on precedence, and not Casio-accurate",
            "High",
          ],
          [
            "One-file monolith",
            "Modes, parser, and UI share one 3,300-line component — every feature change collides",
            "High",
          ],
          [
            "Unused mathjs / Gemini SDK",
            "Dead AI Studio leftovers; mathjs was likely intended as the real engine",
            "Medium",
          ],
          [
            "Menu items that do nothing",
            "MODE 2/4/6/7/8 and SETUP Fix/Sci/Norm look real, then silently return to COMP",
            "Medium",
          ],
          [
            "No golden tests",
            "The manual is full of sample operations that should be the regression suite",
            "High",
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
