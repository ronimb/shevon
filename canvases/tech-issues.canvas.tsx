import { Callout, H1, Stack, Text, useCanvasAction, Button, Row } from "cursor/canvas";

/** Optional view — prefer docs/tech-issues.md. */
export default function TechIssues() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  return (
    <Stack gap={16}>
      <H1>Tech issues (view)</H1>
      <Callout tone="info" title="Markdown wins">
        Open `docs/tech-issues.md`. Canvas optional — see
        `canvases/README.md`.
      </Callout>
      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => open("docs/tech-issues.md")}>
          tech-issues.md
        </Button>
        <Button variant="ghost" onClick={() => open("roadmap.md")}>
          roadmap.md
        </Button>
      </Row>
      <Text tone="secondary">Open R*: R60. Next: finish G6 pairing.</Text>
    </Stack>
  );
}
