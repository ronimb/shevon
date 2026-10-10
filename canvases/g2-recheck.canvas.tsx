import {
  Button,
  Callout,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  TodoListCard,
  useCanvasAction,
  useCanvasState,
  type TodoItem,
  type TodoStatus,
} from "cursor/canvas";

type DoneMap = Record<string, TodoStatus>;

const ROWS: {
  id: string;
  title: string;
  press: string;
  expect: string;
  seed?: TodoStatus;
}[] = [
  {
    id: "r39",
    title: "R39 — empty frac slot",
    press: "AC → a b/c (leave empty)",
    expect: "One empty box per slot; clear of the fraction bar",
    seed: "completed",
  },
  {
    id: "r40",
    title: "R40 — mixed whole box",
    press: "AC → SHIFT a b/c (leave empty)",
    expect: "Empty box on whole (a) with caret inside; num/den also single boxes",
    seed: "completed",
  },
  {
    id: "r41-abc",
    title: "R41 — ab/c mixed result",
    press: "SETUP ▼ → 1 (ab/c) → AC → 5 a b/c 3 =",
    expect: "Mixed 1⅔ (whole beside stacked frac), not a 3-level stack",
    seed: "completed",
  },
  {
    id: "r41-dc",
    title: "R41 keep — d/c improper",
    press: "SETUP ▼ → 2 (d/c) → AC → 5 a b/c 3 =",
    expect: "Improper 5/3 (still matches unit)",
    seed: "completed",
  },
  {
    id: "setup-page2",
    title: "setup-page2 — six rows",
    press: "SHIFT MODE → ▼",
    expect: "1:ab/c 2:d/c 3:CMPLX 4:STAT 5:Disp 6:CONT; FREQ still on 4",
    seed: "completed",
  },
  {
    id: "r42",
    title: "R42 — SHIFT hold",
    press: "Any result → hold SHIFT → ENG → ENG (still held)",
    expect: "S stays lit; both ENG steps are shifted (×10³ steps)",
    seed: "completed",
  },
  {
    id: "r43",
    title: "R43 — DMS after =",
    press: "AC → 2 °′″ 30 °′″ 0 °′″ =",
    expect: "First result 2°30′0″ (not 2.5)",
    seed: "completed",
  },
  {
    id: "r43-sd",
    title: "R43 keep — S⇔D path",
    press: "From DMS result → S⇔D → S⇔D (Norm 1)",
    expect: "DMS → 5/2 → 2.5",
    seed: "completed",
  },
  {
    id: "smoke",
    title: "Smoke — sin(30)",
    press: "AC → sin 30 = (Degree)",
    expect: "0.5",
    seed: "completed",
  },
];

const SEED: DoneMap = Object.fromEntries(
  ROWS.filter((r) => r.seed).map((r) => [r.id, r.seed!]),
);

export default function G2Recheck() {
  const dispatch = useCanvasAction();
  const [done, setDone] = useCanvasState<DoneMap>("g2-recheck-done-v3", SEED);
  const open = (path: string) => dispatch({ type: "openFile", path });

  const todos: TodoItem[] = ROWS.map((r) => ({
    id: r.id,
    content: `${r.title} — ${r.press}`,
    status: done[r.id] ?? r.seed ?? "pending",
  }));

  const completed = todos.filter((t) => t.status === "completed").length;

  const toggle = (todo: TodoItem) => {
    setDone({
      ...done,
      [todo.id]: todo.status === "completed" ? "pending" : "completed",
    });
  };

  const reset = () => setDone({});

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>G2 re-check</H1>
        <Text tone="secondary">
          Historical checklist — all rows passed 10 Oct 2026.
          Next pairing: G3.
        </Text>
      </Stack>

      <Row gap={24} align="end">
        <Stat
          value={`${completed}/${ROWS.length}`}
          label="Checked"
          tone={completed === ROWS.length ? "success" : "warning"}
        />
        <Stat value="pass" label="Re-check" tone="success" />
      </Row>

      <Callout tone="success" title="G2 form fails closed">
        R39–R43 + setup-page2 re-check pass. Do not start a new
        r39-slot slice. Continue at G3 pairing.
      </Callout>

      <TodoListCard
        todos={todos}
        defaultExpanded
        onTodoClick={toggle}
      />

      <H2>What was pressed / expected</H2>
      <Table
        striped
        headers={["Id", "Press", "Expect (match unit)"]}
        rows={ROWS.map((r) => [r.id, r.press, r.expect])}
      />

      <Row gap={8} wrap>
        <Button variant="secondary" onClick={reset}>
          Reset checks
        </Button>
        <Button
          variant="primary"
          onClick={() => open("docs/prompts/g3-pair.md")}
        >
          g3-pair.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/validate-status.md")}
        >
          validate-status.md
        </Button>
      </Row>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/g2-resolve.md")}>
          g2-resolve.md
        </Pill>
        <Pill onClick={() => open("canvases/validate.canvas.tsx")}>
          Unit pairing
        </Pill>
      </Row>
    </Stack>
  );
}
