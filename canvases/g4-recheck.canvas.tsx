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
    id: "r49-log",
    title: "R49 — empty log",
    press: "AC → log (leave empty)",
    expect: "log( with opening paren; caret; NO empty box inside. Unit: no box.",
    seed: "completed",
  },
  {
    id: "r49-ln",
    title: "R49 — empty ln",
    press: "AC → ln (leave empty)",
    expect: "ln( with opening paren; caret; NO empty box. Same family as log.",
    seed: "completed",
  },
  {
    id: "r49-del",
    title: "R49 keep — DEL empty",
    press: "From empty log( → DEL",
    expect: "Template clears (no log( / IR leak). Same on empty ln.",
    seed: "completed",
  },
  {
    id: "r50-e",
    title: "R50 — constant e",
    press: "AC → ALPHA → ×10ˣ (letter e alone)",
    expect: "e reads bolder / italic vs ln function text (unit feel).",
    seed: "completed",
  },
  {
    id: "r50-exp",
    title: "R50 — e^ template",
    press: "AC → SHIFT ln (e^ empty)",
    expect: "Same styled e; empty exponent box ABOVE-RIGHT of e (not beside).",
    seed: "completed",
  },
  {
    id: "r51",
    title: "R51 — log□ closed parens",
    press: "AC → SHIFT log (log□, leave empty / type base)",
    expect: "log with base subscript AND both ( ). Unit closes parens mid-entry.",
    seed: "completed",
  },
  {
    id: "r51-filled",
    title: "R51 keep — log□ value",
    press: "AC → log□ base 2 arg 8 =",
    expect: "Value 3; parens still look closed/correct on the way in.",
    seed: "completed",
  },
  {
    id: "r52",
    title: "R52 — condensed 10^",
    press: "AC → SHIFT log (10^) → type 2 (or leave empty box)",
    expect: "`10` ~one digit wide; exponent ABOVE-RIGHT (not flat beside 10).",
    seed: "completed",
  },
  {
    id: "r53-log",
    title: "R53 — tall parens (log of frac)",
    press: "AC → log → a b/c → 1 ▼ 100 =",
    expect: "Visible ( ) around the stacked frac; parens taller than plain log(100).",
    seed: "completed",
  },
  {
    id: "r53-global",
    title: "R53 global — sin / bare ( )",
    press: "AC → sin → a b/c 1 ▼ 2 ; also AC → ( a b/c 1 ▼ 2 )",
    expect: "Same tall visible parens (not log-only). Abs | | can stay bars.",
    seed: "completed",
  },
  {
    id: "r54-10",
    title: "R54 — 10^ of frac",
    press: "AC → 10^ → a b/c → 1 ▼ 2",
    expect: "`10` sits a bit lower; stacked frac clearly in the exponent (not on baseline).",
    seed: "completed",
  },
  {
    id: "r54-e",
    title: "R54 — e^ of frac",
    press: "AC → e^ → a b/c → 1 ▼ 2",
    expect: "Same base-drop rule as 10^; e stays styled (R50).",
    seed: "completed",
  },
  {
    id: "r54-pwr",
    title: "R54 — xⁿ of frac",
    press: "AC → 5 xⁿ → a b/c → 1 ▼ 2",
    expect: "Base 5 slightly lower; frac reads as the power (shared rule).",
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

export default function G4Recheck() {
  const dispatch = useCanvasAction();
  const [done, setDone] = useCanvasState<DoneMap>("g4-recheck-done-v2", SEED);
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
        <H1>G4 re-check</H1>
        <Text tone="secondary">
          Historical checklist — all rows passed 10 Oct 2026.
          Next pairing: G5.
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

      <Callout tone="success" title="G4 form fails closed">
        R49–R54 re-check pass (Ron, 10 Oct 2026). Continue at G5
        pairing when ready.
      </Callout>

      <TodoListCard todos={todos} defaultExpanded onTodoClick={toggle} />

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
          onClick={() => open("docs/tech-issues.md")}
        >
          tech-issues.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/validate-status.md")}
        >
          validate-status.md
        </Button>
      </Row>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/g4-resolve.md")}>
          g4-resolve.md
        </Pill>
        <Pill onClick={() => open("canvases/validate.canvas.tsx")}>
          Unit pairing
        </Pill>
      </Row>
    </Stack>
  );
}
