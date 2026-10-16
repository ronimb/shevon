import { Callout, H1, Stack, Text, useCanvasAction, Button, Row } from "cursor/canvas";

/** Optional view — prefer roadmap.md. See canvases/README.md. */
export default function ShevonRoadmap() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  return (
    <Stack gap={16}>
      <H1>Roadmap (view)</H1>
      <Callout tone="warning" title="Markdown wins">
        This canvas is optional. Use `roadmap.md` **Now** and
        `docs/README.md`. Agents should not refresh this on handoffs.
      </Callout>
      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => open("roadmap.md")}>
          roadmap.md
        </Button>
        <Button variant="secondary" onClick={() => open("docs/README.md")}>
          docs/README.md
        </Button>
        <Button variant="ghost" onClick={() => open("docs/prompts/g6-pair.md")}>
          g6-pair.md
        </Button>
      </Row>
      <Text tone="secondary">Now: G6 pairing. Phase 3 parked.</Text>
    </Stack>
  );
}
