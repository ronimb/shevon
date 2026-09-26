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

const TRIAGE = `Follow docs/prompts/triage.md exactly. You are triage and oversight only. Do not implement leftovers. Start with one briefing from the files as they are now.`;

const P2_CALC = `Follow docs/prompts/p2-calc.md exactly. One slice. Afterward run docs/prompts/sanity-landed.md. Do not start Dist, stay-in-STAT, EQN 1/2/4, LineIO, or packaging.`;

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
          onClick={() => open("canvases/coverage.canvas.tsx")}
        >
          Coverage canvas
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("canvases/tech-issues.canvas.tsx")}
        >
          Tech-issues canvas
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="p2-calc" label="Next slice" />
        <Stat value="Phase 2" label="Current phase" />
        <Stat value="38/76" label="Coverage done" />
      </Row>

      <Callout tone="info" title="R29 landed">
        ∫ limits sit on the symbol; caret path matches the unit.
        Next is unshifted CALC E-19 (`p2-calc`).
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          ["1", "p2-calc", "Unshifted CALC E-19", "p2-calc.md"],
          ["2–5", "Phase 2", "Dist, stay-in-STAT, EQN 1/2/4", "roadmap Phase 2"],
          ["6", "p4-packaging", "Pages / PWA / exe / icon", "after Phase 2"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(P2_CALC)}>
          Start p2-calc
        </Button>
        <Button
          variant="secondary"
          onClick={() => open("docs/tech-issues.md")}
        >
          Open tech-issues.md
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            start(
              "Follow docs/prompts/sanity-stat.md exactly. Pairing / verification only. Do not implement leftovers or p2-calc.",
            )
          }
        >
          Start STAT pairing
        </Button>
        <Button variant="ghost" onClick={() => start(TRIAGE)}>
          Start triage
        </Button>
      </Row>

      <H2>Gates</H2>
      <Text>
        No Phase 3 until Phase 2 closes. No LineIO / 99-byte / `:` /
        `hist-letters` in this queue. Lying MODE/EQN rows wait on the
        matching feature. Debt A–C stays landed.
      </Text>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/triage.md")}>
          triage.md
        </Pill>
        <Pill onClick={() => open("docs/principles.md")}>principles</Pill>
        <Pill onClick={() => open("backlog.md")}>backlog</Pill>
        <Pill onClick={() => open("docs/prompts/tech-debt.md")}>
          tech-debt (historical)
        </Pill>
      </Row>
    </Stack>
  );
}
