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
          Living backlog for a Casio-accurate fx-991ES PLUS emulator.
          Click a task to open a new chat with that item already mentioned.
          Status below is from the code as of this rewrite, not from older
          kickoff notes.
        </Text>
      </Stack>

      <Callout tone="warning" title="Phase 1 is mostly done — next is visual parity on shipped screens, then STAT/EQN">
        COMP and SETUP Fix/Sci/Norm behave: hyp menu + Abs, ENG, Rnd(,
        Gauss–Kronrod ∫, central-diff d/dx, ▲/▼ replay, CLR, 44 tests.
        Still open in Phase 1: LineIO, Ran# 3-digit, DMS °′″ glyphs, ERROR
        jump-to-token. Visual fidelity of already-shipped templates is not
        signed off — ∫ currently puts a/b to the left of the sign. Do that
        pass before opening new modes.
      </Callout>

      <Callout tone="info" title="Visual fidelity = same elements, relative layout, same behavior">
        Every element on the physical calculator screen must be present in
        the simulator, in the same relative location (e.g. “a” above the
        blank square in the quadratic solver) — not the same pixel
        coordinates. Browser fonts, symbols, and HTML objects are the
        intended LCD. Each element must appear at the same time and
        take/show the same input and output. Applies to already-shipped
        screens as well as new work. Known miss: ∫ should be b above / a
        below the symbol, then f(x)dx to the right.
      </Callout>

      <Row gap={8} wrap>
        <Button
          variant="primary"
          onClick={() =>
            start(
              "Fix already-shipped Natural Display templates to the visual-fidelity bar (same elements, same relative locations, browser fonts OK). Start with ∫: Casio is ∫ with b above / a below the symbol, then f(x)dx to the right — the simulator currently puts a/b to the left of ∫. Then check d/dx, Σ, frac, mix, √/ⁿ√, log_b, abs, nPr/nCr against the manual figures.",
            )
          }
        >
          Fix ∫ layout, then audit COMP templates
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            start(
              "Close Phase 1 leftovers: make Ran# a Casio 3-digit value in [0,1); implement LineIO (or show not-yet instead of a silent no-op); show ° ′ ″ glyphs instead of ° for all three DMS parts; make ERROR ◄/► jump to the bad token (E-40) instead of only clearing the error.",
            )
          }
        >
          Phase 1 leftovers
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            start(
              "Start Phase 2: finish STAT and EQN. SETUP STAT FREQ ON/OFF with row caps, editor Ins/Del-A, 1-VAR Dist P/Q/R and 't, stay in STAT when recalling vars, 2-/3-unknown linear + cubic EQN with complex quadratic roots, and SOLVE UX. Also add EQN a / b / c coefficient labels (relative layout).",
            )
          }
        >
          Start Phase 2 — STAT / EQN
        </Button>
      </Row>

      <H2>Cross-cutting — same elements, relative layout, same behavior</H2>
      <Text>
        Runs alongside every phase, including a pass over screens that
        already exist. A feature is not done until this check passes.
        Browser fonts and HTML are the intended LCD — not a pixelated copy.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "vis-existing",
            status: "pending",
            content:
              "NEXT: audit already-shipped Natural Display templates (∫, d/dx, Σ, frac, mix, √/ⁿ√, log_b, abs, nPr/nCr). Known miss: ∫ puts a/b left of the sign; Casio is ∫ with b above / a below the symbol, then f(x)dx to the right",
          },
          {
            id: "vis-elements",
            status: "pending",
            content:
              "Audit remaining existing screens: EQN quadratic has no a / b / c labels on the coefficient cells; STAT Dist submenu is empty; dual-line answers (Pol/Rec)",
          },
          {
            id: "vis-placement",
            status: "pending",
            content:
              "Keep relative layout vs the hardware — e.g. EQN: “a” above its blank square; ∫: b above / a below the symbol with f(x)dx to the right. Exact coordinates are not required",
          },
          {
            id: "vis-indicators",
            status: "pending",
            content:
              "S / A / M / STO / RCL / STAT / D/R/G / FIX / SCI already light. Remaining: CMPLX/MAT/VCT when those modes exist; Disp; ◀▶; ▲/▼ for COMP replay as well as EQN",
          },
          {
            id: "vis-menus",
            status: "pending",
            content:
              "MODE 2/4/6/7/8 still silently return to COMP — show a clear not-yet (or implement). SETUP LineIO is a no-op. Dist listed with no options",
          },
          {
            id: "vis-cursor",
            status: "pending",
            content:
              "COMP already shows ‸. Extend a caret to EQN/STAT editor cells — a shaded box alone is not enough",
          },
          {
            id: "vis-result",
            status: "pending",
            content:
              "Fix/Sci/Norm, ENG, mixed fractions, and S⇔D continued-fraction exist. Still missing: n√m / p/q·π exact forms, dual-line Pol/Rec r,θ",
          },
          {
            id: "vis-errors",
            status: "pending",
            content:
              "Math / Syntax ERROR strings exist; ±10¹⁰⁰ raises Math ERROR. ◄/► only clear the error — E-40 jump-to-token is not implemented. No Stack / Argument / Time Out screens",
          },
          {
            id: "vis-no-literal",
            status: "completed",
            content:
              "ENG shifts the result; hyp opens a menu; SHIFT hyp is Abs — no literal ENG/hyp dumped onto the LCD",
          },
          {
            id: "vis-checklist",
            status: "pending",
            content:
              "Definition of done (new and already-shipped): vs the manual figure — same elements, same relative locations, same timing/I/O; browser fonts/HTML are fine. COMP ∫ must pass before treating Phase 1 as visually done",
          },
        ]}
        onTodoClick={(todo) => start(`Visual parity: ${todo.content}`)}
      />

      <H2>Phase 0 — Cursor-ready foundation</H2>
      <Text>
        Done. One leftover: ungated console output from LCD calibration
        export and evaluator warnings.
      </Text>
      <TodoListCard
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
              "Typed AST (src/parser.ts) walked by src/evaluator.ts — no new Function",
          },
          {
            id: "p0-tests",
            status: "completed",
            content:
              "Suite grew with Phase 1: 28 golden + 16 parser = 44 tests",
          },
          {
            id: "p0-readme",
            status: "completed",
            content:
              "README covers web / electron, PDF location, and the current unimplemented list",
          },
          {
            id: "p0-deps",
            status: "completed",
            content:
              "Removed @google/genai + mathjs and GEMINI_API_KEY injection; deleted metadata.json",
          },
          {
            id: "p0-asset",
            status: "completed",
            content:
              "calculator_new.png committed under src/; Casio PDF stays gitignored",
          },
          {
            id: "p0-console",
            status: "pending",
            content:
              "Gate remaining console.log (LCD calibration CSS export) and evaluator console.warn behind a debug flag",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 0: ${todo.content}`)}
      />

      <H2>Phase 1 — COMP and SETUP</H2>
      <Text>
        Core COMP keys and SETUP Fix/Sci/Norm are in the code. The pending
        items below are the real leftovers — not a second copy of work that
        already landed.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p1-setup",
            status: "completed",
            content:
              "SETUP Fix 0–9 / Sci 1–10 / Norm 1/2 with FIX/SCI indicators; ab/c vs d/c mixed-fraction toggle",
          },
          {
            id: "p1-lineio",
            status: "pending",
            content:
              "LineIO (SETUP 2) is a no-op that returns to COMP — implement overwrite-cursor LineIO or show not-yet",
          },
          {
            id: "p1-hyp",
            status: "completed",
            content:
              "hyp opens sinh/cosh/tanh + inverses; SHIFT hyp is Abs",
          },
          {
            id: "p1-rand",
            status: "pending",
            content:
              "SHIFT . / ALPHA . are wired, but Ran# is Math.random() — Casio is a 3-digit value in [0,1) (0.000–0.999)",
          },
          {
            id: "p1-eng",
            status: "completed",
            content:
              "ENG / SHIFT ENG shift the displayed result into engineering exponents — no literal ENG text",
          },
          {
            id: "p1-dms",
            status: "pending",
            content:
              "Sexagesimal input and result toggle work, but all three parts display as ° — use ° ′ ″ glyphs",
          },
          {
            id: "p1-rnd",
            status: "completed",
            content:
              "Rnd( follows current Fix/Sci/Norm, including the Fix-3 10÷3×3 golden",
          },
          {
            id: "p1-int",
            status: "completed",
            content:
              "∫ Gauss–Kronrod (G7–K15) and d/dx central difference + Richardson; goldens pin ∫x²=1/3, d/dx x²|₃=6. Visual layout of ∫ is still wrong — see vis-existing",
          },
          {
            id: "p1-replay",
            status: "completed",
            content:
              "LCD history replay with ▲/▼ in COMP; side pane kept as an extra",
          },
          {
            id: "p1-errors",
            status: "pending",
            content:
              "Math/Syntax ERROR strings and ±10¹⁰⁰ Math ERROR exist. ◄/► only clear the error — implement E-40 jump-to-token, then AC to clear",
          },
          {
            id: "p1-clr",
            status: "completed",
            content: "SHIFT 9 CLR menu: 1:Setup 2:Memory 3:All",
          },
          {
            id: "p1-vars-sto",
            status: "pending",
            content:
              "BUG: 8 SHIFT STO A looks stored (8→A) but RCL A then = is Math ERROR. Root cause: calculateStatVars(null) returns A/B/C=NaN (NaN-delete only runs when statType is set); evaluateExpression spreads statVars over user vars so stored A is overwritten. Fix env merge / stop emitting NaN A/B/C in COMP. Goldens pass an empty statVars object so they miss this. D/E/F/X/Y likely still work",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 1: ${todo.content}`)}
      />

      <H2>Phase 2 — Finish STAT and EQN</H2>
      <Text>
        These modes already have UI. Close the behavioral and layout gaps
        before opening new modes. Quadratic EQN runs (real roots only) with
        unlabeled coefficient cells.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p2-freq",
            status: "pending",
            content:
              "SETUP STAT FREQ ON/OFF — the flag exists but is never set; editor row limits 80 / 40 / 26",
          },
          {
            id: "p2-edit",
            status: "pending",
            content:
              "STAT Edit Ins and Del-A; DEL currently edits the cell value, not the line",
          },
          {
            id: "p2-dist",
            status: "pending",
            content:
              "1-VAR Dist: P( Q( R( and normalized variate 't — menu row 5 is empty",
          },
          {
            id: "p2-stat-mode",
            status: "pending",
            content:
              "Stay in STAT when recalling variables — insertStatVar currently jumps to COMP",
          },
          {
            id: "p2-eqn-labels",
            status: "pending",
            content:
              "EQN quadratic editor: show a / b / c in the same relative layout as the hardware (label above each blank), not an unlabeled row of cells",
          },
          {
            id: "p2-eqn-linear",
            status: "pending",
            content:
              "EQN 2-unknown and 3-unknown linear systems — menu text only today",
          },
          {
            id: "p2-eqn-cubic",
            status: "pending",
            content:
              "EQN cubic; quadratic complex roots in Natural Display (negative disc currently says “No real solutions”)",
          },
          {
            id: "p2-solve",
            status: "pending",
            content:
              "SOLVE: prompt remaining variables, initial X, L−R residual, Continue — Newton–Raphson on X exists, failures show as Syntax ERROR",
          },
        ]}
        onTodoClick={(todo) => start(`Phase 2: ${todo.content}`)}
      />

      <H2>Phase 3 — Remaining Casio modes</H2>
      <Text>
        Menu rows 2/4/6/7/8 still fall through to COMP. One mode per slice,
        each with manual sample operations as tests, plus the visual-fidelity
        check.
      </Text>
      <TodoListCard
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

      <H2>Phase 4 — Exact results and packaging</H2>
      <TodoListCard
        todos={[
          {
            id: "p4-exact",
            status: "pending",
            content:
              "Natural result forms: n√m, p/q π — continued-fraction decimals and mixed fractions already exist",
          },
          {
            id: "p4-samples",
            status: "pending",
            content:
              "44 tests cover a subset of the manual — automate the remaining numbered sample operations",
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

      <H2>Suggested next sprint</H2>
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
          Fix shipped COMP templates
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              Start with ∫ relative layout (b above / a below the symbol,
              f(x)dx to the right), then the rest of the Natural Display
              templates. This is the visual-fidelity gate for work that
              already shipped.
            </Text>
            <Button
              variant="secondary"
              onClick={() =>
                dispatch({
                  type: "openFile",
                  path: "src/display.tsx",
                })
              }
            >
              Open display.tsx
            </Button>
          </Stack>
        </CardBody>
      </Card>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>2</Pill>}>
          Close Phase 1 leftovers
        </CardHeader>
        <CardBody>
          <Text>
            Ran# 3-digit, LineIO honesty, DMS °′″ glyphs, and ERROR
            jump-to-token. Do not re-do hyp / ENG / Fix / Rnd / numerics —
            those are already in the code.
          </Text>
        </CardBody>
      </Card>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>3</Pill>}>
          Phase 2 — STAT then EQN
        </CardHeader>
        <CardBody>
          <Text>
            FREQ SETUP, stay-in-STAT, Dist, then EQN a/b/c labels plus
            2-/3-unknown and cubic. MODE 2/4/6/7/8 stay “not yet” until
            Phase 3.
          </Text>
        </CardBody>
      </Card>
      <H3>Out of scope until Phase 3</H3>
      <Text tone="secondary">MATRIX, VECTOR, TABLE, CONST, CONV, CMPLX, BASE-N.</Text>
      <H3>Permanently out of scope</H3>
      <Text tone="secondary">
        Hardware items (battery, contrast, auto power-off). A custom
        pixelated LCD font — browser fonts and HTML are the display.
      </Text>
    </Stack>
  );
}
