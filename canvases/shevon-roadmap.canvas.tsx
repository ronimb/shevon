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

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Roadmap</H1>
        <Text tone="secondary">
          Visual view of `roadmap.md` (refreshed 25 Sep 2026). Markdown is
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
        <Button
          variant="ghost"
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "canvases/tech-debt.canvas.tsx",
            })
          }
        >
          Tech-debt canvas
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="Phase 2" label="Current phase" tone="warning" />
        <Stat value="5" label="Phase 2 items open" />
        <Stat value="15" label="Open issues" tone="warning" />
        <Stat value="37/76" label="Coverage done" />
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
            "Packaging pulled forward",
            "p4-packaging after remaining P2; surd/π and PDF samples stay here",
          ],
        ]}
        striped
      />

      <Callout tone="info" title="Priority (25 Sep 2026)">
        Engine tech debt first, then sanity on landed COMP/STAT/EQN/SOLVE,
        then remaining Phase 2, then packaging. Phase 3 stays gated. Gap 1
        (typed errors) already landed with SOLVE.
      </Callout>

      <H2>Now — tech debt</H2>
      <Card>
        <CardHeader trailing={<Pill size="sm" active>this program</Pill>}>
          Slices A–C landed
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              A, B, and C landed: source-map / E-40 jump, the Calculator
              shell split, and `CalcValue` (`real` | `complex` | `pair`).
              Then remaining Phase 2, then `p4-packaging`. LineIO is not
              debt.
            </Text>
            <Row gap={8} wrap>
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/sanity-landed.md",
                  })
                }
              >
                Sanity checklist
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/tech-debt.md",
                  })
                }
              >
                Program index
              </Button>
            </Row>
          </Stack>
        </CardBody>
      </Card>

      <H2>Phase 2 remaining</H2>
      <Text tone="secondary">
        After A/B/C and sanity. Close these before opening Phase 3. Ids
        match `roadmap.md`. Debt slices have landed; do not start these
        from a debt chat.
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
        onTodoClick={(todo) => {
          if (todo.status === "completed") return;
          dispatch({
            type: "openFile",
            path: "docs/prompts/tech-debt.md",
          });
        }}
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
          ["vis-result", "Surd/π forms, complex a+bi (Pol/Rec dual-line landed with debt-value)"],
          ["vis-errors", "◀▶ jump landed (debt-source-map). Stack / Argument screens still open"],
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
