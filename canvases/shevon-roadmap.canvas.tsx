import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  TodoListCard,
  UsageBar,
  useCanvasAction,
} from "cursor/canvas";

export default function ShevonRoadmap() {
  const dispatch = useCanvasAction();

  const start = (prompt: string) => {
    dispatch({ type: "newComposerChat", userPrompt: prompt });
  };

  const principles =
    "Follow docs/principles.md: match Casio function behavior; visual fidelity means every hardware element is present, in the hardware's position/role, and behaves the same (not pixel-perfect). Update roadmap.md and issues.md in the same change. ";

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Roadmap</H1>
        <Text tone="secondary">
          Visual view of `roadmap.md` (refreshed 24 Sep 2026). Markdown is
          the source of truth. This canvas is a phase board and launch pad,
          not a second plan.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button
          variant="primary"
          onClick={() => dispatch({ type: "openFile", path: "roadmap.md" })}
        >
          Open roadmap.md
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: "openFile", path: "issues.md" })}
        >
          Open issues.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "openFile", path: "backlog.md" })}
        >
          Open backlog.md
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            dispatch({ type: "openFile", path: "docs/principles.md" })
          }
        >
          Principles
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="Phase 2" label="Current phase" tone="warning" />
        <Stat value="5" label="Phase 2 items open" />
        <Stat value="15" label="Open issues" tone="warning" />
        <Stat value="36/76" label="Coverage done" />
      </Row>

      <UsageBar
        total={5}
        topLeftLabel="Phase progress (source: roadmap.md)"
        topRightLabel="0 and 1 landed · 2 in progress · 3 and 4 not started"
        segments={[
          { id: "p0", value: 1, color: "green" },
          { id: "p1", value: 1, color: "green" },
          { id: "p2", value: 1, color: "yellow" },
          { id: "p3", value: 1, color: "gray" },
          { id: "p4", value: 1, color: "gray" },
        ]}
      />

      <Callout tone="success" title="Visual fidelity = elements + placement + behavior">
        Not pixel-perfect mimicry. Every hardware element must be present,
        in the hardware’s position/role, and behave the same. Never dump
        literal function text. Never let a menu silently fall through to
        COMP. Full rules: `docs/principles.md`.
      </Callout>

      <H2>Phases</H2>
      <Table
        headers={["Phase", "Status", "Goal"]}
        columnAlign={["left", "left", "left"]}
        rowTone={["success", "success", "warning", "neutral", "neutral"]}
        rows={[
          [
            "0 Foundation",
            "Landed",
            "Typed AST, tests, no AI Studio deps, honest README",
          ],
          [
            "1 COMP / SETUP",
            "Landed",
            "Fix/Sci/Norm, hyp, Ran#, ENG, DMS, Rnd, Gauss–Kronrod, CLR",
          ],
          [
            "2 STAT / EQN",
            "In progress",
            "Ins/Del-A, Dist, stay in STAT, linear/cubic EQN (SOLVE landed)",
          ],
          [
            "3 Remaining modes",
            "Not started",
            "CMPLX, BASE-N, MATRIX, VECTOR, TABLE, CONST/CONV — after Phase 2",
          ],
          [
            "4 Fidelity / packaging",
            "Not started",
            "Surd/π result forms, full PDF samples, Pages / PWA / exe",
          ],
        ]}
        striped
      />

      <Callout tone="info" title="Priority (12 Sep 2026)">
        Visual slice mostly landed: `vis-no-literal` done (no IR-stem leaks;
        trig/hyp/ln painted) and `vis-indicators` ◀▶ + COMP-history ▲▼ light.
        Remaining visual: `vis-errors` jump-to-token (deferred — needs an
        evaluator fault offset), STAT ▲▼, `vis-elements`. `p2-solve` landed
        (typed `CalcError` + E-20 procedure). Close the rest of Phase 2 next.
        Daily-driver bar is COMP + STAT + EQN. Phase 3 stays gated. Lying
        menus wait for the matching feature.
      </Callout>

      <H2>Now — visual leftovers</H2>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>mostly landed</Pill>}>
          COMP LCD parity
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              Landed: IR stems never reach the LCD — trig/hyp/`ln` paint styled
              names and unclosed `sqrt(24^(2-2)‸` shows a radical, not the
              letters `sqrt` (shared LCD/History table in `src/display.tsx`).
              ◀▶ light from caret navigability and ▲▼ light for COMP history
              replay. Remaining: `vis-errors` ◀▶ jump-to-token (deferred —
              needs an evaluator fault offset), STAT ▲▼, `vis-elements`. Disp
              and CMPLX/MAT/VCT stay dim (no backing state yet / Phase 3).
            </Text>
            <Row gap={8} wrap>
              <Button
                variant="primary"
                onClick={() =>
                  start(
                    "Follow docs/prompts/now-visual-slice.md exactly. That file is the kickoff prompt for the Now visual slice. Include vis-no-literal / ir-leak: unclosed templates must not leak IR names (e.g. sqrt). Do not treat this as a Math ERROR evaluator ticket. Update roadmap.md and issues.md in the same change.",
                  )
                }
              >
                Start visual slice
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/now-visual-slice.md",
                  })
                }
              >
                Open kickoff prompt
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  start(
                    "Follow docs/prompts/p2-solve-errors.md exactly. That file is the kickoff prompt for typed errors + honest SOLVE (p2-solve / solve-errors). Do CalcError first, then Variable ERROR / Can't Solve / initial X / L−R / Continue. Do not start vis-errors jump-to-token, an IR rewrite, or the rest of Phase 2.",
                  )
                }
              >
                Start p2-solve (typed errors)
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/p2-solve-errors.md",
                  })
                }
              >
                Open SOLVE kickoff
              </Button>
            </Row>
          </Stack>
        </CardBody>
      </Card>

      <H2>Phase 2 remaining</H2>
      <Text tone="secondary">
        Close these before opening Phase 3. Ids match `roadmap.md`.
      </Text>
      <TodoListCard
        defaultExpanded
        todos={[
          {
            id: "p2-solve",
            status: "completed",
            content:
              "p2-solve — typed CalcError + SOLVE UX landed (Variable ERROR / Can’t Solve / solve for x / x= + L-R= / Continue)",
          },
          {
            id: "p2-edit",
            status: "pending",
            content:
              "p2-edit — STAT Edit Ins and Del-A; DEL deletes a line (issue stat-del)",
          },
          {
            id: "p2-dist",
            status: "pending",
            content:
              "p2-dist — 1-VAR Dist: P( Q( R( and normalized variate 't (issue dist-empty)",
          },
          {
            id: "p2-stat-mode",
            status: "pending",
            content:
              "p2-stat-mode — Stay in STAT when recalling variables (issue stat-jump-comp)",
          },
          {
            id: "p2-eqn-linear",
            status: "pending",
            content: "p2-eqn-linear — EQN 2-unknown and 3-unknown linear systems",
          },
          {
            id: "p2-eqn-cubic",
            status: "pending",
            content:
              "p2-eqn-cubic — EQN cubic (quadratic a+bi already landed; exact √ form is p4-exact)",
          },
        ]}
        onTodoClick={(todo) =>
          start(`${principles}Roadmap ${todo.content}`)
        }
      />

      <H2>Cross-cutting visual fidelity</H2>
      <Text>
        Runs alongside every phase. Inventory:
        `docs/visual-fidelity-inventory.md`. `vis-cursor` and EQN quadratic
        placement have landed.
      </Text>
      <Table
        headers={["Id", "Open work"]}
        rows={[
          ["vis-elements", "Missing captions, dual-line answers, leftover unlabeled editors"],
          ["vis-indicators", "◀▶ + COMP ▲▼ landed. Remaining: STAT ▲▼, Disp; CMPLX/MAT/VCT with Phase 3"],
          ["vis-menus", "Not a standalone pass — fix when the matching feature ships"],
          ["vis-result", "Surd/π forms, complex a+bi, dual-line Pol/Rec (Phase 4 / later)"],
          ["vis-errors", "◀▶ jump-to-token (E-40) deferred — needs evaluator fault offset"],
          ["vis-no-literal", "Landed: trig/hyp/ln painted; unclosed templates no longer leak IR"],
          ["vis-checklist", "Element + behavior parity vs the manual figure"],
        ]}
        striped
      />

      <H2>COMP leftovers (unphased)</H2>
      <Text tone="secondary">
        Pull into the current phase when they block honesty. Full list in
        `roadmap.md`.
      </Text>
      <Table
        headers={["Id", "Gap"]}
        rows={[
          ["comp-lineio", "MthIO / LineIO still display-only"],
          ["comp-colon", "Multi-statements : and Disp"],
          ["comp-drg", "SHIFT DRG ° r g conversions"],
          ["comp-bytes", "99-byte input limit + cursor-k"],
          ["comp-sep", "SETUP Dot / Comma separator"],
          ["comp-calc", "CALC UX vs Casio prompt flow"],
          ["comp-range", "Per-function ranges; factorial 69; Σ bounds"],
          ["comp-keys", "Letter keys steal typing; Shift hold vs toggle"],
        ]}
        striped
      />

      <H2>Out of scope until later</H2>
      <Text tone="secondary">
        Hardware contrast, battery, auto power-off. Pixel-perfect LCD font
        (not before Phase 3 is done). Do not re-implement Phase 0 / Phase 1.
        Unassigned ideas live in `backlog.md`, not here.
      </Text>
    </Stack>
  );
}
