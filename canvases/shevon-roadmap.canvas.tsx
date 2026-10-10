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

const TRIAGE = `Follow docs/prompts/supervisor.md exactly. You are the Shevon supervisor (triage and oversight). Do not implement leftovers. Start with one briefing from the files as they are now.`;

const G5 = `Follow docs/prompts/g5-pair.md exactly.
Pairing only: G5 trig and hyperbolic.
Guide and scribe. Do not implement. Do not start Phase 3.
Update validate-status.md when done.`;

export default function ShevonRoadmap() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  const start = (prompt: string) =>
    dispatch({ type: "newComposerChat", userPrompt: prompt });

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Roadmap</H1>
        <Text tone="secondary">
          View of `roadmap.md` **Now**. Markdown wins if this disagrees.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => open("roadmap.md")}>
          Open roadmap.md
        </Button>
        <Button variant="secondary" onClick={() => open("docs/tech-issues.md")}>
          Tech issues
        </Button>
        <Button variant="secondary" onClick={() => open("issues.md")}>
          Issues
        </Button>
        <Button variant="ghost" onClick={() => open("docs/coverage.md")}>
          Coverage
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("canvases/validate.canvas.tsx")}
        >
          Unit pairing
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="G5" label="Now" tone="warning" />
        <Stat value="pairing" label="Next" />
        <Stat value="p3-*" label="Parked (low)" />
      </Row>

      <Callout tone="info" title="Polish exe first">
        Current goal: polish the daily exe on COMP + STAT + EQN.
        `g4-resolve` landed (`R49`–`R54`). Next: **G5 pairing**.
        Phase 3 stays parked.
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          [
            "1",
            "G5 pairing",
            "Trig / hyperbolic (walk + log)",
            "g5-pair.md",
          ],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(G5)}>
          Start G5 pairing
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/g5-pair.md")}
        >
          g5-pair.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/validate-status.md")}
        >
          validate-status.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("roadmap.md")}
        >
          Phase 3 (parked)
        </Button>
        <Button variant="ghost" onClick={() => start(TRIAGE)}>
          Start supervisor
        </Button>
      </Row>

      <H2>Gates</H2>
      <Text>
        g4-resolve landed (`R49`–`R54`). Now: G5 pairing. Phase 3
        parked. No LineIO / 99-byte / `:` / `hist-letters`.
        Debt A–C landed. EQN 1–4 run.
      </Text>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/supervisor.md")}>
          supervisor.md
        </Pill>
        <Pill onClick={() => start(TRIAGE)}>Start supervisor</Pill>
        <Pill onClick={() => open("docs/prompts/validate-status.md")}>
          validate-status.md
        </Pill>
        <Pill onClick={() => open("docs/prompts/validate-unit.md")}>
          validate-unit.md
        </Pill>
      </Row>
    </Stack>
  );
}
