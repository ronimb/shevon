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

const P4_PACKAGING = `Follow docs/prompts/p4-packaging.md exactly. One slice. Verify first, then one surface at a time so Ron can try it. Afterward smoke docs/prompts/sanity-landed.md. Do not start Phase 3, LineIO, or p4-exact.`;

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
        <Stat value="p4-packaging" label="Next slice" />
        <Stat value="Packaging" label="Current slice" />
        <Stat value="45/76" label="Coverage done" />
      </Row>

      <Callout tone="info" title="p4-packaging — exe ready to launch">
        `dist-desktop/Shevon.exe` is built. Waiting on Ron
        to launch it. Pages only if a live desktop URL is wanted.
        Do not start Phase 3.
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          ["1", "p4-packaging", "Pages / PWA / exe / icon", "p4-packaging.md"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(P4_PACKAGING)}>
          Start p4-packaging
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
              "Follow docs/prompts/sanity-stat.md exactly. Pairing / verification only. Do not implement leftovers or packaging.",
            )
          }
        >
          Start STAT pairing
        </Button>
      </Row>

      <H2>Gates</H2>
      <Text>
        No Phase 3 until packaging. `p4-tauri` is scheduled
        (small exe) but is not Now and does not block Phase 3.
        No LineIO / 99-byte / `:` / `hist-letters` in this
        queue. Lying MODE rows wait on the matching feature.
        Debt A–C stays landed. EQN 1–4 run.
      </Text>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/supervisor.md")}>
          supervisor.md
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
