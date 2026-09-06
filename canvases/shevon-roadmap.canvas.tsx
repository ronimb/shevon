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

      <Callout tone="success" title="Phase 1 complete — COMP and SETUP are honest">
        On top of the Phase 0 foundation (typed-AST engine, no `new Function`,
        AI-Studio leftovers gone), COMP now behaves like the hardware: SETUP
        Fix/Sci/Norm with lit indicators, the hyp menu + Abs, Ran#/RanInt#,
        ENG, sexagesimal °′″, and Rnd( — plus Gauss–Kronrod ∫, central-diff
        d/dx, ▲/▼ history replay, ERROR ◄/► editing, and SHIFT 9 CLR. 44
        tests pass. Next: Phase 2 — finish STAT and EQN before opening new
        modes.
      </Callout>

      <Callout tone="info" title="Visual fidelity = all elements present + same behavior">
        Not pixel-perfect mimicry — browser fonts and our own HTML rendering
        are fine, and we can lean on our technical advantages as long as we
        stay stylistically close to the hardware (today's look is a good
        proxy). The bar for every feature: each visual element the real
        fx-991ES PLUS shows is present, in the hardware's position/role, and
        behaves the same. Example: the EQN quadratic editor must show the
        a / b / c coefficient labels and put the active number entry at the
        bottom-left like the real unit — not an unlabeled boxed grid. This
        applies to all modes and all phases, not just Phase 4.
      </Callout>

      <Row gap={8} wrap>
        <Button
          variant="primary"
          onClick={() =>
            start(
              "Start Phase 1: make COMP and SETUP honest. Implement SETUP Fix/Sci/Norm with FIX/SCI indicators, the hyp menu (SHIFT hyp = Abs), Ran#/RanInt#, ENG shift, sexagesimal °′″, and Rnd( — never dump the literal letters ENG or hyp onto the LCD.",
            )
          }
        >
          Start Phase 1
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            start(
              "Replace the trapezoid ∫ (n=100) with Gauss–Kronrod and the forward-difference d/dx with a central difference plus tolerance, so numeric methods match the Casio to displayed precision. Add golden tests from the manual.",
            )
          }
        >
          Casio-accurate numerics
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            start(
              "Finish STAT and EQN: SETUP STAT FREQ ON/OFF with row caps, editor Ins/Del-A, 1-VAR distributions (P/Q/R and 't), keep STAT active when recalling vars, and add 2-/3-unknown linear + cubic EQN with complex quadratic roots.",
            )
          }
        >
          Finish STAT / EQN
        </Button>
      </Row>

      <H2>Cross-cutting — match the hardware's elements and behavior in every feature</H2>
      <Text>
        Runs alongside every phase. Not pixel-perfect mimicry — our fonts and
        HTML rendering are fine, and we can use technical advantages (show more
        at once, cleaner layout) while staying stylistically close (today's
        look is a good proxy). The bar: every element the real unit shows is
        present and in a sensible place, and each feature behaves functionally
        the same. Use the manual figures and a photo as the element/behavior
        checklist, not a pixel reference.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "vis-elements",
            status: "pending",
            content:
              "Audit each screen against the hardware and add any missing elements — e.g. EQN's a / b / c coefficient labels, mode/menu captions, dual-line answers — even if styled our own way",
          },
          {
            id: "vis-placement",
            status: "pending",
            content:
              "Put entry and answer in the hardware's position/role — e.g. EQN quadratic: active number entry at the bottom-left, coefficients in a labeled a / b / c layout",
          },
          {
            id: "vis-indicators",
            status: "pending",
            content:
              "All status indicators present and lit when the unit lights them: S / A (SHIFT/ALPHA), M, STO, RCL, STAT, CMPLX, D/R/G, FIX/SCI, Disp, ◀▶▲▼ (roughly matching positions; our styling is fine)",
          },
          {
            id: "vis-menus",
            status: "pending",
            content:
              "Every MODE / SETUP / STAT-type / EQN / distribution menu shows the same options and captions the hardware does — never a placeholder or a silent COMP fallback",
          },
          {
            id: "vis-cursor",
            status: "pending",
            content:
              "Show where the next character lands — a caret in the active field (COMP already uses ‸; extend to the EQN/STAT editor cells). A shaded box alone is not enough",
          },
          {
            id: "vis-result",
            status: "pending",
            content:
              "Offer the same result forms the unit can — S⇔D fraction/surd/π, complex a+bi, ×10ⁿ scientific, dual-line Pol/Rec r,θ — glyphs may be our fonts",
          },
          {
            id: "vis-errors",
            status: "pending",
            content:
              "Error screens carry the same elements/behavior (Math / Syntax / Stack / Argument ERROR) with the ◀▶ jump-to-token behavior from E-40",
          },
          {
            id: "vis-no-literal",
            status: "pending",
            content:
              "Never show literal function text (ENG, hyp) where the hardware shows a symbol or opens a menu",
          },
          {
            id: "vis-checklist",
            status: "pending",
            content:
              "Definition of done per feature: an element + behavior parity check vs the manual figure — same elements, same placement/role, same behavior; pixel-exactness not required",
          },
        ]}
        onTodoClick={(todo) => start(`Visual parity: ${todo.content}`)}
      />

      <H2>Phase 0 — Cursor-ready foundation</H2>
      <Text>
        Goal: the repo is understandable, testable, and honest about what
        it is. Complete — one small console cleanup remains.
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
            status: "completed",
            content:
              "Stop evaluating via new Function; parse into a typed AST (src/parser.ts) and walk it (src/evaluator.ts) so tests can assert intermediate forms",
          },
          {
            id: "p0-tests",
            status: "completed",
            content:
              "Golden tests from the manual: sin 30=0.5, 2/3+1/2=7/6, nPr/nCr samples, STAT mean/σx on E-24 (6 golden + 16 parser = 22)",
          },
          {
            id: "p0-readme",
            status: "completed",
            content:
              "Replace AI Studio README with how to run web / electron, where the PDF lives, and what is unimplemented",
          },
          {
            id: "p0-deps",
            status: "completed",
            content:
              "Removed @google/genai + mathjs and the GEMINI_API_KEY injection from vite.config.ts; deleted metadata.json",
          },
          {
            id: "p0-asset",
            status: "completed",
            content:
              "calculator_new.png committed under src/ and loading; Casio PDF stays gitignored",
          },
          {
            id: "p0-console",
            status: "pending",
            content:
              "Remove the remaining console.log of expressions; keep any diagnostics behind a debug flag",
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
            status: "completed",
            content:
              "∫ now uses adaptive Gauss–Kronrod (G7–K15) and d/dx a central difference + Richardson; golden tests pin ∫x²=1/3, d/dx x²|₃=6",
          },
          {
            id: "p1-replay",
            status: "completed",
            content:
              "LCD history replay with ▲/▼ in COMP (▲ recalls previous, ▼ walks back to a live line); side pane kept as an extra",
          },
          {
            id: "p1-errors",
            status: "completed",
            content:
              "Math/Syntax ERROR: ◄/► return to the expression for editing, AC clears; results beyond ±10¹⁰⁰ raise Math ERROR",
          },
          {
            id: "p1-clr",
            status: "completed",
            content: "SHIFT 9 CLR menu: 1:Setup 2:Memory 3:All",
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

      <H2>Suggested next sprint (this week)</H2>
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
          Fix lying keys
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              ENG, hyp, Ran#/RanInt, Abs, SETUP Fix/Sci/Norm, and MODE
              2/4/6/7/8 currently look like Casio and then fail. Either
              implement them or show a clear “not yet” on the LCD — do not
              insert the letters ENG into the expression.
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
          Make SETUP real
        </CardHeader>
        <CardBody>
          <Text>
            Fix/Sci/Norm is the unlock for Rnd(, engineering notation, and
            Casio-accurate result formatting. Wire the SETUP pages and light
            the FIX/SCI indicators before touching new modes.
          </Text>
        </CardBody>
      </Card>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>3</Pill>}>
          Trust the numerics
        </CardHeader>
        <CardBody>
          <Text>
            Swap the trapezoid ∫ and forward d/dx for Gauss–Kronrod and a
            central difference with tolerance, then pin them with golden
            tests from the manual so ∫ and d/dx match the hardware.
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
