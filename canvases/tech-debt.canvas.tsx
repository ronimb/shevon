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

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Tech-debt framework</H1>
        <Text tone="secondary">
          View of `roadmap.md` Now §1 (25 Sep 2026). One slice per new
          chat. Chat links often do nothing — use the buttons or Ctrl+P.
        </Text>
      </Stack>

      <Row gap={24} align="end">
        <Stat value="4 / 4" label="Gaps done (CalcError + A + B + C)" tone="success" />
        <Stat value="—" label="Debt slices left" tone="success" />
        <Stat value="101" label="Tests after slice C" />
      </Row>

      <Callout tone="info" title="Order is fixed">
        A, B, and C landed. Run sanity on landed COMP/STAT/EQN, then
        remaining Phase 2, then packaging. LineIO is not debt.
        Phase 3 stays gated.
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
            "docs/prompts/debt-value.md",
            "CalcValue real|complex|pair; COMP looks the same",
          ],
        ]}
        striped
      />

      <Card>
        <CardHeader trailing={<Pill size="sm" tone="success">landed</Pill>}>
          Slice C
        </CardHeader>
        <CardBody>
          <Text>
            Evaluator returns CalcValue (real | complex | pair). EQN a+bi
            uses complex. Top-level Pol/Rec paints a single line
            (r=…, θ=… / bottom-right x=…, y=…).
            Conjugate / arg / polar helpers and reserved integer / matrix
            kinds are on the same type. COMP decimals and fractions are
            unchanged. Next: remaining Phase 2 — not from this chat.
          </Text>
        </CardBody>
      </Card>

      <H2>Later work (do not start yet)</H2>
      <Row gap={8} wrap>
        <Button
          variant="ghost"
          onClick={() =>
            dispatch({
              type: "openFile",
              path: "docs/prompts/debt-value.md",
            })
          }
        >
          Open C prompt
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            dispatch({ type: "openFile", path: "docs/prompts/tech-debt.md" })
          }
        >
          Program index
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "openFile", path: "roadmap.md" })}
        >
          Roadmap
        </Button>
      </Row>
    </Stack>
  );
}
