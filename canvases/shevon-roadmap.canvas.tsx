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

const PHASE3 = `Follow roadmap.md Phase 3. One slice: p3-cmplx. Do not start LineIO, comp-keys, hist-letters, or p4-exact. Do not change COMP / STAT / EQN EVAL.`;

const VALIDATE = `Follow docs/prompts/validate-unit.md exactly. Pairing / verification only. Workflow: walk + log only; fixes are a separate chat. Default: guide and scribe. Do NOT drive the browser unless Ron asks.`;

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
        <Stat value="p3-cmplx" label="Next slice" />
        <Stat value="g1-resolve" label="Landed" tone="success" />
        <Stat value="46/76" label="Coverage done" />
      </Row>

      <Callout tone="info" title="p3-cmplx is Now">
        show-keys-size is in (chip scale, face, strip chrome, History
        scroll). Pairing stays walk-and-log only. Next sitting is G2.
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          ["1", "p3-cmplx", "CMPLX mode", "roadmap Phase 3"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(PHASE3)}>
          Start p3-cmplx
        </Button>
        <Button variant="ghost" onClick={() => start(VALIDATE)}>
          Start unit pairing
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("roadmap.md")}
        >
          Phase 3
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/tech-issues.md")}
        >
          Open tech-issues.md
        </Button>
        <Button variant="ghost" onClick={() => start(TRIAGE)}>
          Start supervisor
        </Button>
      </Row>

      <H2>Gates</H2>
      <Text>
        Packaging + Tauri + `g1-resolve` + `show-keys-size` are in.
        Next: `p3-cmplx`. No LineIO / 99-byte / `:` / `hist-letters`
        in this queue. Lying MODE rows wait on the matching feature.
        Debt A–C stays landed. EQN 1–4 run.
      </Text>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/supervisor.md")}>
          supervisor.md
        </Pill>
        <Pill onClick={() => start(TRIAGE)}>Start supervisor</Pill>
        <Pill onClick={() => open("roadmap.md")}>
          Phase 3
        </Pill>
        <Pill onClick={() => open("docs/prompts/validate-unit.md")}>
          validate-unit.md
        </Pill>
      </Row>
    </Stack>
  );
}
