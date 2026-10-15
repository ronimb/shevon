import {
  Button,
  Callout,
  H1,
  Pill,
  Row,
  Stack,
  Stat,
  Text,
  useCanvasAction,
} from "cursor/canvas";

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
        <Stat value="0" label="Open R-ids" />
        <Stat value="G6" label="Next" />
      </Row>

      <Callout tone="success" title="R55–R59 closed in g5-resolve">
        Show-keys SHIFT/`×10ˣ`; π/`e` across ÷; empty trig/hyp boxes;
        Alt sticky on blur; Abs bars vs tall frac. `R36` remains
        dropped. Phase 3 parked.
      </Callout>

      <Row gap={8} wrap>
        <Button
          variant="primary"
          onClick={() => open("roadmap.md")}
        >
          Open roadmap
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            start(
              "Follow docs/prompts/supervisor.md exactly. You are the Shevon supervisor (triage and oversight). Do not implement leftovers.",
            )
          }
        >
          Start supervisor
        </Button>
      </Row>

      <Text tone="secondary">
        `ti-stat` … `ti-edges`, `R17`, `R27`–`R35`, `R37`–`R59` closed
        (`R36` dropped). Open: none. Next: G6 pairing.
        Phase 3 stays parked.
      </Text>

      <Row gap={8} wrap>
        <Pill
          active
          onClick={() => open("canvases/shevon-roadmap.canvas.tsx")}
        >
          Roadmap canvas
        </Pill>
        <Pill onClick={() => open("canvases/validate.canvas.tsx")}>
          Validate canvas
        </Pill>
      </Row>
    </Stack>
  );
}
