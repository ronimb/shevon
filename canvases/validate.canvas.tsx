import { Callout, H1, Stack, Text, useCanvasAction, Button, Row } from "cursor/canvas";

/** Optional view — prefer g6-pair.md + validate-unit.md. */
export default function Validate() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  return (
    <Stack gap={16}>
      <H1>Unit pairing (view)</H1>
      <Callout tone="warning" title="Markdown wins">
        Prefer `docs/prompts/g6-pair.md`, `validate-unit.md`, and
        `validate-status.md`. See `docs/README.md` / `canvases/README.md`.
      </Callout>
      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => open("docs/prompts/g6-pair.md")}>
          g6-pair.md
        </Button>
        <Button
          variant="secondary"
          onClick={() => open("docs/prompts/validate-unit.md")}
        >
          validate-unit.md
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("docs/prompts/validate-status.md")}
        >
          validate-status.md
        </Button>
      </Row>
      <Text tone="secondary">
        Cadence: one case prompt; findings only; no code in pairing.
      </Text>
    </Stack>
  );
}
