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
        <Stat value="0" label="Open R-ids" tone="success" />
        <Stat value="G5" label="Pairing next" />
      </Row>

      <Callout tone="info" title="G4 form closed">
        `R49`–`R54` closed in `g4-resolve`. `R36` (`×10ˣ` glyph)
        remains dropped. Honesty leftovers stay on `issues.md`.
        Phase 3 is parked (low priority).
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
        `ti-stat` … `ti-edges`, `R17`, `R27`–`R35`, `R37`–`R54` closed
        (`R36` dropped). Next: G5 pairing. Phase 3 stays parked.
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
