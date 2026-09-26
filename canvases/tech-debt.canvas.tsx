import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
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

export default function TechDebtFramework() {
  const dispatch = useCanvasAction();

  const start = (prompt: string) => {
    dispatch({ type: "newComposerChat", userPrompt: prompt });
  };

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Tech-debt framework</H1>
        <Text tone="secondary">
          Historical view of `roadmap.md` Now §1. A–C landed 25 Sep 2026.
          Chat links often do nothing — use the buttons or Ctrl+P.
        </Text>
      </Stack>

      <Row gap={24} align="end">
        <Stat value="4 / 4" label="Gaps done (CalcError + A + B + C)" tone="success" />
        <Stat value="p2-calc" label="Next leftover" tone="warning" />
        <Stat value="p2-edit" label="STAT Edit landed" tone="success" />
      </Row>

      <Callout tone="success" title="Debt program closed">
        A source-map, B shell split, and C CalcValue are in the tree.
        Remaining Now work is sanity, then Phase 2 leftovers, then
        packaging. LineIO is not debt. Phase 3 stays gated.
      </Callout>

      <H2>Slices</H2>
      <Table
        headers={["Slice", "Id", "Prompt", "Done when"]}
        columnAlign={["left", "left", "left", "left"]}
        rowTone={["success", "success", "success", "success"]}
        rows={[
          [
            "0",
            "p2-solve",
            "(landed)",
            "CalcError + Variable ERROR / Can’t Solve / L−R",
          ],
          [
            "A",
            "debt-source-map",
            "(landed)",
            "offset set; left/right jumps to the fault token",
          ],
          [
            "B",
            "debt-shell",
            "(landed)",
            "Calculator.tsx split; no behavior change",
          ],
          [
            "C",
            "debt-value",
            "(landed)",
            "CalcValue real|complex|pair; Pol/Rec pair line",
          ],
        ]}
        striped
      />

      <Card>
        <CardHeader trailing={<Pill size="sm" active>next</Pill>}>
          Remaining Phase 2
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              `p2-edit` landed (DEL deletes a STAT line; Edit → Ins / Del-A).
              Next leftover is unshifted CALC (E-19).
            </Text>
            <Row gap={8} wrap>
              <Button
                variant="primary"
                onClick={() =>
                  start(
                    "Follow docs/prompts/p2-calc.md exactly. Slice p2-calc only (unshifted CALC, E-19). Afterward run docs/prompts/sanity-landed.md. Do not start Dist, stay-in-STAT, EQN 1/2/4, LineIO, or packaging.",
                  )
                }
              >
                Start p2-calc
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/p2-calc.md",
                  })
                }
              >
                Open p2-calc prompt
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/sanity-landed.md",
                  })
                }
              >
                Sanity checklist
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/phase-2.md",
                  })
                }
              >
                Phase 2 index
              </Button>
            </Row>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
