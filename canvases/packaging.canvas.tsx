import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
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

const P4 = `Follow docs/prompts/p4-packaging.md exactly. One slice. Inventory already ran. Icon is in. PWA install is skipped. Portable exe is built. Do not Read src/calculator_new.png or public/icons/*.png. After Ron launches the exe, Pages only if he wants a live desktop URL. Afterward smoke docs/prompts/sanity-landed.md. Do not start Phase 3, LineIO, setup-page2, or p4-exact.`;

const SANITY = `Follow docs/prompts/sanity-landed.md exactly. Smoke COMP / STAT / EQN only. Do not implement leftovers or start Phase 3.`;

const TRIAGE = `Follow docs/prompts/supervisor.md exactly. You are the Shevon supervisor (triage and oversight). Do not implement leftovers. Start with one briefing from the files as they are now.`;

const PAIR = `Follow docs/prompts/sanity-stat.md exactly. Pairing / verification only. Do not implement leftovers or packaging.`;

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
          View of `roadmap.md` `p4-packaging` and
          `docs/prompts/p4-packaging.md`. Markdown wins if this
          disagrees.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(P4)}>
          Continue p4-packaging
        </Button>
        <Button
          variant="secondary"
          onClick={() => open("docs/prompts/p4-packaging.md")}
        >
          Open kickoff
        </Button>
        <Button variant="ghost" onClick={() => start(SANITY)}>
          Start sanity-landed
        </Button>
        <Button variant="ghost" onClick={() => start(TRIAGE)}>
          Start supervisor
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="p4-packaging" label="Now slice" tone="warning" />
        <Stat value="exe" label="Waiting on Ron" tone="warning" />
        <Stat value="45/76" label="Coverage done" />
      </Row>

      <Callout tone="warning" title="Stop — Ron launches the exe">
        Frameless window. Show keys / More are a strip above
        the unit, never on the face. Show keys centers the
        scaled unit. Pin is an icon. Bring-to-front is under
        Keyboard (same shortcut hides). Launch
        `dist-desktop/Shevon.exe`.
        `sin(30)` still 0.5.
      </Callout>

      <H2>Surfaces</H2>
      <Table
        striped
        headers={["#", "Surface", "Now", "Ron tries"]}
        rowTone={["success", "success", "neutral", "warning", "info"]}
        rows={[
          [
            "1",
            "Inventory",
            "Icons in public/icons/; skip re-inventory",
            "npm test / lint stay green",
          ],
          [
            "2",
            "Local icon",
            "Lettermark accepted",
            "Tab shows Shevon + filled S icon",
          ],
          [
            "3",
            "PWA",
            "Skipped — no mobile need",
            "Written reason; do not wait on install",
          ],
          [
            "4",
            "Portable exe",
            "One frameless Shevon.exe",
            "Launch; sin(30) = 0.5",
          ],
          [
            "5",
            "GitHub Pages",
            "workflow + npm run deploy",
            "Live URL loads the unit",
          ],
        ]}
      />
      <Text tone="secondary">
        Source: `roadmap.md` `p4-packaging` · 27 Sep 2026.
      </Text>

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Wired this stop</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>Manifest name / short_name is Shevon</Text>
              <Text>`start_url` and `scope` are `./`</Text>
              <Text>Local 192 / 256 / 512 icons, no CDN</Text>
              <Text>`dist-desktop/Shevon.exe` built</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Still open</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>Ron has not launched the exe yet</Text>
              <Text>Pages URL not verified this stop</Text>
              <Text>
                Do not `Read` overlay or `public/icons/*.png`
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <H2>Launch</H2>
      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(P4)}>
          Continue p4-packaging
        </Button>
        <Button variant="secondary" onClick={() => start(SANITY)}>
          Smoke sanity-landed
        </Button>
        <Button variant="ghost" onClick={() => start(PAIR)}>
          STAT pairing
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/p4-packaging.md")}
        >
          p4-packaging.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("package.json")}
        >
          package.json
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("public/manifest.json")}
        >
          manifest.json
        </Button>
        <Button
          variant="ghost"
          onClick={() => open(".github/workflows/deploy.yml")}
        >
          Pages workflow
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/p4-tauri.md")}
        >
          p4-tauri.md
        </Button>
      </Row>

      <H2>Parked (not this slice)</H2>
      <Table
        striped
        headers={["Id", "Why parked"]}
        rows={[
          ["Phase 3 p3-*", "After packaging"],
          [
            "p4-tauri",
            "After packaging; plan in p4-tauri.md (Edge→Tauri→APIs→Ron)",
          ],
          ["p4-exact / p4-samples", "After modes; not Now"],
          ["setup-page2", "vis-menus; CMPLX/Disp/CONT wait"],
          ["lineio-display", "comp-lineio"],
          ["lying-menus", "MODE 2/4/6/7/8 until p3-*"],
        ]}
      />

      <Row gap={8} wrap>
        <Pill active onClick={() => open("roadmap.md")}>
          roadmap.md
        </Pill>
        <Pill onClick={() => open("docs/coverage.md")}>
          coverage.md
        </Pill>
        <Pill onClick={() => open("docs/principles.md")}>
          principles
        </Pill>
        <Pill onClick={() => open("canvases/shevon-roadmap.canvas.tsx")}>
          Roadmap canvas
        </Pill>
        <Pill onClick={() => open("docs/prompts/supervisor.md")}>
          supervisor.md
        </Pill>
      </Row>
    </Stack>
  );
}
