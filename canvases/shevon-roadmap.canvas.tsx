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

const VALIDATE = `Follow docs/prompts/validate-unit.md exactly. Pairing only — start at G3. Guide and scribe; Ron presses unit and Shevon. Do not drive the browser unless Ron asks. Do not implement. Finish G3, update validate-status.md, stop.`;

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
        <Stat value="(empty)" label="Now" />
        <Stat value="G3" label="Next pairing" tone="warning" />
        <Stat value="p3-*" label="Parked (low)" />
      </Row>

      <Callout tone="info" title="Polish exe first">
        Current goal: polish the daily exe on COMP + STAT + EQN
        (pairing → fix → re-check). `g2-resolve` landed. Next: G3
        pairing. Phase 3 stays parked.
      </Callout>

      <H2>Now</H2>
      <Table
        striped
        headers={["#", "Id", "What", "Kickoff"]}
        rows={[
          ["—", "(empty)", "Pairing-driven after next G3 sitting", "validate-unit.md"],
        ]}
      />

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(VALIDATE)}>
          Start G3 pairing
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/validate-unit.md")}
        >
          validate-unit.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("roadmap.md")}
        >
          Phase 3 (parked)
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
        Packaging + Tauri + `g1-resolve` + `g2-resolve` +
        `show-keys-size` are in. Now queue empty. Phase 3 stays
        parked. No LineIO / 99-byte / `:` / `hist-letters`. Debt
        A–C landed. EQN 1–4 run.
      </Text>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/supervisor.md")}>
          supervisor.md
        </Pill>
        <Pill onClick={() => start(TRIAGE)}>Start supervisor</Pill>
        <Pill onClick={() => open("docs/prompts/validate-unit.md")}>
          validate-unit.md
        </Pill>
        <Pill onClick={() => open("docs/prompts/g2-resolve.md")}>
          g2-resolve.md (landed)
        </Pill>
      </Row>
    </Stack>
  );
}
