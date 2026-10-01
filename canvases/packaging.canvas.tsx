import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  H2,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasAction,
} from "cursor/canvas";

const PHASE3 = `Follow roadmap.md Phase 3. One slice: p3-cmplx. Do not start LineIO, hist-letters, or p4-exact. Do not change COMP / STAT / EQN beyond what that mode requires.`;

const SANITY = `Follow docs/prompts/sanity-landed.md exactly. Smoke COMP / STAT / EQN only. Do not implement leftovers or start Phase 3.`;

const TRIAGE = `Follow docs/prompts/supervisor.md exactly. You are the Shevon supervisor (triage and oversight). Do not implement leftovers. Start with one briefing from the files as they are now.`;

const VALIDATE = `Follow docs/prompts/validate-unit.md exactly. Pairing / verification only. Start at G2. Default: guide and scribe — tell Ron what to press on the unit then Shevon; wait for his reports. Do NOT drive the browser unless Ron asks. Do not implement leftovers, Phase 3, LineIO, or packaging.`;

export default function Packaging() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  const start = (prompt: string) =>
    dispatch({ type: "newComposerChat", userPrompt: prompt });

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Packaging</H1>
        <Text tone="secondary">
          Historical view of landed `p4-packaging` + `p4-tauri`.
          Markdown wins. **Now** is `p3-cmplx`.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(PHASE3)}>
          Start p3-cmplx
        </Button>
        <Button
          variant="secondary"
          onClick={() => open("roadmap.md")}
        >
          Open roadmap
        </Button>
        <Button variant="ghost" onClick={() => start(VALIDATE)}>
          Start unit pairing
        </Button>
        <Button variant="ghost" onClick={() => start(TRIAGE)}>
          Start supervisor
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="landed" label="p4-packaging" tone="success" />
        <Stat value="landed" label="p4-tauri" tone="success" />
        <Stat value="p3-cmplx" label="Now slice" />
      </Row>

      <Callout tone="success" title="p4-tauri landed (29 Sep 2026)">
        Daily `build:exe` → WebView2 `Shevon.exe` (~10 MB). Electron
        fallback `build:exe:electron`. Phase E signed by Ron.
      </Callout>

      <H2>Surfaces</H2>
      <Table
        striped
        headers={["#", "Surface", "Outcome"]}
        rowTone={["success", "success", "success", "success", "success", "success"]}
        rows={[
          ["1", "Inventory", "Icons in public/icons/; green"],
          ["2", "Local icon", "Tab / manifest / win.icon"],
          ["3", "PWA install", "Skipped — no mobile need"],
          ["4", "Portable exe", "Tauri ~10 MB; sin(30) = 0.5"],
          ["5", "GitHub Pages", "Skipped — no live URL wanted"],
          ["6", "WebView2 shell", "p4-tauri soft cutover"],
        ]}
      />
      <Text tone="secondary">
        Source: `roadmap.md` Phase 4 · 29 Sep 2026.
      </Text>

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Shipped</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>Manifest name / short_name is Shevon</Text>
              <Text>`start_url` and `scope` are `./`</Text>
              <Text>Local icons, no CDN</Text>
              <Text>`dist-desktop/Shevon.exe` (~10 MB Tauri)</Text>
              <Text>Electron → `Shevon-electron.exe` fallback</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Next</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>`p3-cmplx` — CMPLX mode</Text>
              <Text>`show-keys-size` landed</Text>
              <Text>Unit pairing at G2 (separate chat)</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Launch</H2>
      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(PHASE3)}>
          Start p3-cmplx
        </Button>
        <Button variant="secondary" onClick={() => start(SANITY)}>
          Smoke sanity-landed
        </Button>
        <Button variant="ghost" onClick={() => start(VALIDATE)}>
          Unit pairing (G2)
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/p4-packaging.md")}
        >
          p4-packaging.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/p4-tauri.md")}
        >
          p4-tauri.md
        </Button>
      </Row>
    </Stack>
  );
}
