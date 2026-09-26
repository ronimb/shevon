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
  useCanvasAction,
} from "cursor/canvas";

const R28 = `R28 is next (roadmap.md Now row 1). Write the kickoff under docs/prompts/ when opening. ×10ˣ paints condensed ×10; caret keeps the exponent. Afterward run docs/prompts/sanity-landed.md. Do not start R29 or p2-calc.`;

export default function TechIssues() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  const start = (prompt: string) =>
    dispatch({ type: "newComposerChat", userPrompt: prompt });

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Tech issues</H1>
        <Text tone="secondary">
          Open rows from `docs/tech-issues.md`. Closed `ti-*` ids stay
          in that file. Markdown wins.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => open("docs/tech-issues.md")}>
          Open tech-issues.md
        </Button>
        <Button variant="secondary" onClick={() => open("roadmap.md")}>
          Roadmap
        </Button>
        <Button variant="ghost" onClick={() => open("issues.md")}>
          Honesty leftovers
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="2" label="Open (R28 R29)" tone="warning" />
        <Stat value="R28" label="Next" tone="danger" />
      </Row>

      <Callout tone="info" title="Not this file">
        `lying-menus`, `calc-ux`, Dist, LineIO stay on `issues.md`.
        Do not copy R-ids there.
      </Callout>

      <H2>Open</H2>
      <Table
        striped
        headers={["Id", "Finding", "Kickoff"]}
        rowTone={["danger", "warning"]}
        rows={[
          ["R28", "×10ˣ paints 10^; caret drops exponent", "write when opening"],
          ["R29", "∫ limits + caret path ≠ unit", "write when opening"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(R28)}>
          Start R28
        </Button>
        <Button
          variant="secondary"
          onClick={() => open("roadmap.md")}
        >
          Open roadmap
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            start(
              "Follow docs/prompts/triage.md exactly. You are triage and oversight only. Do not implement leftovers.",
            )
          }
        >
          Start triage
        </Button>
      </Row>

      <Text tone="secondary">
        `ti-stat` … `ti-edges`, `R17`, and `R27` are closed in the catalog.
      </Text>

      <Row gap={8} wrap>
        <Pill
          active
          onClick={() => open("canvases/shevon-roadmap.canvas.tsx")}
        >
          Roadmap canvas
        </Pill>
        <Pill onClick={() => open("docs/prompts/sanity-stat.md")}>
          sanity-stat
        </Pill>
      </Row>
    </Stack>
  );
}
