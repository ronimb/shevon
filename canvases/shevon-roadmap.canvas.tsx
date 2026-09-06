import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Text,
  TodoListCard,
  useCanvasAction,
} from "cursor/canvas";

export default function ShevonRoadmap() {
  const dispatch = useCanvasAction();

  const start = (prompt: string) => {
    dispatch({ type: "newComposerChat", userPrompt: prompt });
  };

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Roadmap and action items</H1>
        <Text tone="secondary">
          Concrete work after the Gemini → Cursor move. The goal is a
          Casio-accurate fx-991ES PLUS emulator, not another generic
          scientific calculator. Click a task to open a new chat with that
          item already mentioned.
        </Text>
      </Stack>

      <Callout tone="warning" title="Do this first">
        Stabilize the foundation before adding MATRIX or CMPLX. The monolith
        plus `new Function` will make every new mode more expensive if we
        keep piling into `App.tsx`.
      </Callout>

      <Row gap={8} wrap>
        <Button
          variant="primary"
          onClick={() =>
            start(
              "Split src/App.tsx into modules (evaluator, display, keys, COMP/STAT/EQN) without changing behavior. Add a first golden-test file from the Casio manual examples.",
            )
          }
        >
          Start Phase 0
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            start(
              "Replace new Function evaluation with a real parser (prefer the already-installed mathjs or a dedicated AST). Keep the current template language as the frontend IR.",
            )
          }
        >
          Start engine swap
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            start(
              "Audit src/calculator_new.png, README, unused @google/genai and mathjs usage, and GEMINI_API_KEY in vite.config.ts. Clean AI Studio leftovers without breaking the overlay emulator.",
            )
          }
        >
          Clean AI Studio leftovers
        </Button>
      </Row>

      <H2>Phase 0 — Cursor-ready foundation</H2>
      <Text>
        Goal: the repo is understandable, testable, and honest about what
        it is. No new Casio modes yet.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p0-split",
            status: "completed",
            content:
              "Split App.tsx: evaluator, formatMath/toLaTeX, key map, COMP handlers, STAT, EQN, Calculator shell",
          },
          {
            id: "p0-engine",
            status: "pending",
            content:
              "Stop evaluating via new Function; use mathjs or a custom AST so tests can assert intermediate forms",
          },
          {
            id: "p0-tests",
            status: "completed",
            content:
              "Golden tests from the manual: sin 30=0.5, 2/3+1/2=7/6, nPr/nCr samples, STAT mean/σx sample on E-24",
          },
          {
            id: "p0-readme",
            status: "pending",
            content:
              "Replace AI Studio README with how to run web / electron, where the PDF lives, and what is unimplemented",
          },
          {
            id: "p0-deps",
            status: "pending",
            content:
              "Remove @google/genai and GEMINI_API_KEY unless we truly need them; decide to use or drop mathjs",
          },
          {
            id: "p0-asset",
            status: "pending",
            content:
              "Confirm calculator_new.png is committed and loads; keep the Casio PDF gitignored",
          },
          {
            id: "p0-console",
            status: "pending",
            content:
              "Remove evaluateExpression console.log of full expressions; keep errors behind a debug flag",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 0: ${todo.content}`)}
      />

      <H2>Phase 1 — Make COMP and SETUP honest</H2>
      <Text>
        Goal: every key on the faceplate that belongs to COMP does the
        Casio thing, or is explicitly disabled — never dump the letters
        ENG or hyp onto the LCD.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p1-setup",
            status: "pending",
            content:
              "Implement SETUP: LineIO, Fix 0–9, Sci 1–10, Norm 1/2, ab/c vs d/c; light FIX/SCI indicators",
          },
          {
            id: "p1-hyp",
            status: "pending",
            content:
              "hyp key opens sinh/cosh/tanh menu; SHIFT hyp is Abs; wire inverse hyp",
          },
          {
            id: "p1-rand",
            status: "pending",
            content:
              "SHIFT . = Ran# (3-digit < 1); ALPHA . = RanInt#(a,b)",
          },
          {
            id: "p1-eng",
            status: "pending",
            content:
              "ENG / SHIFT ENG shift the displayed result into engineering exponents",
          },
          {
            id: "p1-dms",
            status: "pending",
            content:
              "Sexagesimal input ° ′ ″ and toggle with the °′″ key",
          },
          {
            id: "p1-rnd",
            status: "pending",
            content: "Rnd( according to current Fix/Sci/Norm, including the 10÷3×3 example",
          },
          {
            id: "p1-int",
            status: "pending",
            content:
              "Replace trapezoid ∫ and forward d/dx with Casio-like Gauss–Kronrod and central difference + tol",
          },
          {
            id: "p1-replay",
            status: "pending",
            content:
              "LCD history replay with ▲/▼ in COMP; keep the side pane as an extra",
          },
          {
            id: "p1-errors",
            status: "pending",
            content:
              "Math/Syntax ERROR: left/right jump to the bad token; AC clears; ranges from E-38",
          },
          {
            id: "p1-clr",
            status: "pending",
            content: "SHIFT 9 CLR: Setup / Memory / All",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 1: ${todo.content}`)}
      />

      <H2>Phase 2 — Finish STAT and EQN</H2>
      <Text>
        These modes already have UI. Close the behavioral gaps before
        opening new modes.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p2-freq",
            status: "pending",
            content: "SETUP STAT FREQ ON/OFF; editor row limits 80 / 40 / 26",
          },
          {
            id: "p2-edit",
            status: "pending",
            content: "STAT Edit Ins and Del-A; DEL deletes a line in the editor",
          },
          {
            id: "p2-dist",
            status: "pending",
            content: "1-VAR Dist: P( Q( R( and normalized variate 't",
          },
          {
            id: "p2-stat-mode",
            status: "pending",
            content:
              "Stay in STAT when recalling variables instead of silently jumping to COMP",
          },
          {
            id: "p2-eqn-linear",
            status: "pending",
            content: "EQN 2-unknown and 3-unknown linear systems",
          },
          {
            id: "p2-eqn-cubic",
            status: "pending",
            content: "EQN cubic; quadratic complex roots in Natural Display",
          },
          {
            id: "p2-solve",
            status: "pending",
            content:
              "SOLVE: prompt remaining variables, initial X, L−R residual, Continue screen",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 2: ${todo.content}`)}
      />

      <H2>Phase 3 — Remaining Casio modes</H2>
      <Text>
        One mode per slice, each with manual sample operations as tests
        before considering it done.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p3-cmplx",
            status: "pending",
            content: "CMPLX: i, ∠, a+bi / r∠θ, arg, Conjg, 'r∠θ / 'a+bi",
          },
          {
            id: "p3-basen",
            status: "pending",
            content: "BASE-N: bases, d/h/b/o prefixes, logic ops, 16/32-bit ranges",
          },
          {
            id: "p3-matrix",
            status: "pending",
            content: "MATRIX: Dim/Data, MatA/B/C/Ans, det Trn inverse Abs powers",
          },
          {
            id: "p3-vector",
            status: "pending",
            content: "VECTOR: 2D/3D, dot, cross, Abs, VctAns",
          },
          {
            id: "p3-table",
            status: "pending",
            content: "TABLE: f(x), Start/End/Step, Insufficient MEM at >30 rows",
          },
          {
            id: "p3-const",
            status: "pending",
            content: "CONST 01–40 (CODATA 2007) and CONV 01–40 (NIST SP 811)",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 3: ${todo.content}`)}
      />

      <H2>Phase 4 — Fidelity and packaging</H2>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p4-exact",
            status: "pending",
            content:
              "Natural result forms: n√m, p/q π, mixed fractions — not just continued-fraction decimals",
          },
          {
            id: "p4-samples",
            status: "pending",
            content:
              "Automate every numbered sample operation in the PDF as a regression suite",
          },
          {
            id: "p4-packaging",
            status: "pending",
            content:
              "Verify GitHub Pages, PWA, and electron-builder portable exe; real app icon",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 4: ${todo.content}`)}
      />

      <H2>Suggested first sprint (this week)</H2>
      <GridLike />
    </Stack>
  );
}

function GridLike() {
  const dispatch = useCanvasAction();
  return (
    <Stack gap={16}>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>1</Pill>}>
          Inventory freeze
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              Treat the coverage canvas as the backlog. Do not add CMPLX
              until Phase 0 tests exist for COMP samples on E-16–E-18.
            </Text>
            <Button
              variant="secondary"
              onClick={() =>
                dispatch({
                  type: "openFile",
                  path: "canvases/casio-coverage.canvas.tsx",
                })
              }
            >
              Open coverage
            </Button>
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>2</Pill>}>
          Extract evaluator
        </CardHeader>
        <CardBody>
          <Text>
            Move `evaluateExpression`, `calculateStatVars`, and
            `toFraction` out of the React component. That is the seam for
            tests and for replacing `new Function`.
          </Text>
        </CardBody>
      </Card>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>3</Pill>}>
          Fix lying keys
        </CardHeader>
        <CardBody>
          <Text>
            ENG, hyp, Ran#/RanInt, Abs, SETUP Fix/Sci/Norm, and MODE 2/4/6/7/8
            currently look like Casio and then fail. Either implement or
            show a clear “not yet” on the LCD — do not insert the letters
            ENG into the expression.
          </Text>
        </CardBody>
      </Card>
      <H3>Out of scope until Phase 3</H3>
      <Text tone="secondary">
        MATRIX, VECTOR, TABLE, CONST, CONV, and a pixel-perfect LCD font.
        Hardware items (battery, contrast, auto power-off) stay skipped.
      </Text>
    </Stack>
  );
}
