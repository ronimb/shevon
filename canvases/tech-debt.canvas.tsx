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
          View of `roadmap.md` Now §1 (25 Sep 2026). One slice per new
          chat. Chat links often do nothing — use the buttons or Ctrl+P.
        </Text>
      </Stack>

      <Row gap={24} align="end">
        <Stat value="3 / 4" label="Gaps done (CalcError + A + B)" tone="success" />
        <Stat value="C" label="Next slice" tone="warning" />
        <Stat value="95" label="Tests after slice B" />
      </Row>

      <Callout tone="info" title="Order is fixed">
        A and B landed. Next chat is C CalcValue only. Sanity after each.
        Then remaining Phase 2, then packaging. LineIO is not debt.
        Phase 3 stays gated.
      </Callout>

      <H2>Slices</H2>
      <Table
        headers={["Slice", "Id", "Prompt", "Done when"]}
        columnAlign={["left", "left", "left", "left"]}
        rowTone={["success", "success", "success", "warning"]}
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
          Slice B
        </CardHeader>
        <CardBody>
          <Text>
            Calculator.tsx now composes lcd.tsx, keyboard.ts,
            useCalculatorState, and modeRouter.ts. insertStatVar lives in
            modes/stat.tsx and still jumps to COMP. Next chat is slice C
            only — do not mix Phase 2 leftovers into that chat.
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader trailing={<Pill size="sm" active>start here</Pill>}>
          Slice C
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              Evaluator returns CalcValue (real | complex | pair). COMP
              decimals and fractions must look the same. EQN a+bi uses the
              same type.
            </Text>
            <Row gap={8} wrap>
              <Button
                variant="primary"
                onClick={() =>
                  start(
                    "Follow docs/prompts/debt-value.md exactly. Slice C only (debt-value). Afterward run docs/prompts/sanity-landed.md. Do not start Phase 2 leftovers or packaging.",
                  )
                }
              >
                Start slice C
              </Button>
              <Button
                variant="secondary"
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
                  dispatch({
                    type: "openFile",
                    path: "docs/prompts/sanity-landed.md",
                  })
                }
              >
                Sanity checklist
              </Button>
            </Row>
          </Stack>
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
