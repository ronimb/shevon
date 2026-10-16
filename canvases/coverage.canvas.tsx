import { Callout, H1, Stack, useCanvasAction, Button } from "cursor/canvas";

/** Optional view — prefer docs/coverage.md. */
export default function Coverage() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  return (
    <Stack gap={16}>
      <H1>Coverage (view)</H1>
      <Callout tone="info" title="Markdown wins">
        Use `docs/coverage.md` — not this canvas.
      </Callout>
      <Button variant="primary" onClick={() => open("docs/coverage.md")}>
        coverage.md
      </Button>
    </Stack>
  );
}
