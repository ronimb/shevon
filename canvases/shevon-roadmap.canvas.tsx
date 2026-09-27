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
        <Stat value="p4-packaging" label="Next slice" />
        <Stat value="Phase 2" label="Current phase" />
        <Stat value="45/76" label="Coverage done" />
      </Row>

      <Callout tone="info" title="p2-eqn-cubic landed">
        EQN type 4 (cubic) a/b/c/d and E-28 Ex.5 run. Phase 2 slices
        are checked. Next is packaging (`p4-packaging`); write the
        kickoff when opening. Do not start Phase 3 yet.
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          ["1", "p4-packaging", "Pages / PWA / exe / icon", "write when opening"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(TRIAGE)}>
          Start triage
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
              "Follow docs/prompts/sanity-stat.md exactly. Pairing / verification only. Do not implement leftovers or p2-dist.",
            )
          }
        >
          Start STAT pairing
        </Button>
      </Row>

      <H2>Gates</H2>
      <Text>
        No Phase 3 until packaging. No LineIO / 99-byte / `:` /
        `hist-letters` in this queue. Lying MODE rows wait on the
        matching feature. Debt A–C stays landed. EQN 1–4 run.
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
