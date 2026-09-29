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

const SHOW_KEYS = `Follow docs/prompts/show-keys-size.md exactly. One slice. Do not start Phase 3 leftovers, LineIO, or p4-exact. Do not change COMP / STAT / EQN beyond Show keys sizing.`;

const VALIDATE = `Follow docs/prompts/validate-unit.md exactly. Pairing / verification only. Start at G2. Default: guide and scribe — tell Ron what to press on the unit then Shevon; wait for his reports. Do NOT drive the browser unless Ron asks. Do not implement leftovers, Phase 3, LineIO, or packaging.`;

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
          onClick={() => open("canvases/packaging.canvas.tsx")}
        >
          Packaging canvas
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("canvases/validate.canvas.tsx")}
        >
          Unit pairing
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="show-keys-size" label="Next slice" />
        <Stat value="p4-tauri" label="Landed" tone="success" />
        <Stat value="46/76" label="Coverage done" />
      </Row>

      <Callout tone="info" title="show-keys-size is Now">
        Then Phase 3. After G1 wraps, next pairing sitting is G14
        (Show keys size), then G2+.
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          ["1", "show-keys-size", "Scale Show keys chips (small laptop)", "show-keys-size.md"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(SHOW_KEYS)}>
          Start show-keys-size
        </Button>
        <Button variant="secondary" onClick={() => start(VALIDATE)}>
          Start unit pairing
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/show-keys-size.md")}
        >
          show-keys-size.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/tech-issues.md")}
        >
          Open tech-issues.md
        </Button>
      </Row>

      <H2>Gates</H2>
      <Text>
        Packaging + Tauri are in. Next: `show-keys-size`, then Phase 3.
        No LineIO / 99-byte / `:` / `hist-letters` in this
        queue. Lying MODE rows wait on the matching feature.
        Debt A–C stays landed. EQN 1–4 run.
      </Text>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/supervisor.md")}>
          supervisor.md
        </Pill>
        <Pill onClick={() => start(TRIAGE)}>Start supervisor</Pill>
        <Pill onClick={() => open("docs/prompts/show-keys-size.md")}>
          show-keys-size.md
        </Pill>
        <Pill onClick={() => open("docs/prompts/validate-unit.md")}>
          validate-unit.md
        </Pill>
      </Row>
    </Stack>
  );
}
