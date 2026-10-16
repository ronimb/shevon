import { Callout, H1, Stack, Text, useCanvasAction, Button } from "cursor/canvas";

/** Optional view — packaging landed; see roadmap Landed. */
export default function Packaging() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  return (
    <Stack gap={16}>
      <H1>Packaging (view)</H1>
      <Callout tone="info" title="Landed">
        `p4-packaging` / `p4-tauri` are in. Daily: `npm run build:exe`.
        Details: `roadmap.md` Landed — not this canvas.
      </Callout>
      <Button variant="primary" onClick={() => open("roadmap.md")}>
        roadmap.md
      </Button>
      <Text tone="secondary">See canvases/README.md.</Text>
    </Stack>
  );
}