import {
  Button,
  Callout,
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

const PRE = `Follow docs/prompts/validate-unit.md exactly. Pairing / verification only. Do not implement leftovers, Phase 3, p4-tauri, LineIO, or packaging. Ron has the unit. You drive Shevon. For every item check form and function. Log new fails to docs/tech-issues.md or issues.md — never both. Do not refile known leftovers.`;

const group = (id: string) =>
  `${PRE} Start with ${id} only. Finish that group, then stop.`;

export default function Validate() {
  const dispatch = useCanvasAction();
  const open = (path: string) => dispatch({ type: "openFile", path });
  const start = (prompt: string) =>
    dispatch({ type: "newComposerChat", userPrompt: prompt });

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Unit pairing</H1>
        <Text tone="secondary">
          View of `docs/prompts/validate-unit.md`. Markdown wins.
          Each function is in exactly one group.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(group("G2"))}>
          Start G2 fractions
        </Button>
        <Button
          variant="secondary"
          onClick={() => open("docs/prompts/validate-unit.md")}
        >
          Open kickoff
        </Button>
        <Button
          variant="ghost"
          onClick={() => start(PRE + " Ask Ron which group to walk.")}
        >
          Start (pick group)
        </Button>
      </Row>

      <Row gap={24} align="end">
        <Stat value="14" label="Groups" />
        <Stat value="G2" label="Next sitting" tone="warning" />
        <Stat value="G13" label="Honesty only" />
      </Row>

      <Callout tone="warning" title="Pairing only">
        Form and function vs the unit. One group per sitting. Do
        not implement. G1 logged `R30` / `R31` — start at **G2**.
        Known leftovers stay parked (`setup-page2`, `lying-menus`,
        `prompt-prev-size`, `ind-arrows`, `p4-exact`).
      </Callout>

      <H2>Groups (no overlap)</H2>
      <Table
        striped
        headers={["Id", "Group", "What is in here"]}
        rows={[
          ["G1", "Arithmetic and entry", "Done sitting — R30 / R31 open"],
          ["G2", "Fractions and display", "Frac, S⇔D, Fix/Sci/Norm, ENG, %, DMS"],
          ["G3", "Powers and roots", "x² x³ xⁿ √ ³√ ⁿ√ x⁻¹"],
          ["G4", "Logs and exponentials", "log ln log□ 10^ e^"],
          ["G5", "Trigonometry and hyperbolic", "D/R/G, sin family, hyp, Abs"],
          ["G6", "Combinatorics and random", "x! nPr nCr Ran# RanInt#"],
          ["G7", "Calculus templates", "∫ caret, d/dx, Σ"],
          ["G8", "Polar and rectangular", "Pol Rec + X,Y"],
          ["G9", "Memory", "STO RCL A–F X Y M CLR"],
          ["G10", "CALC and SOLVE", "Prompts, errors, Continue"],
          ["G11", "STAT", "Types, FREQ, Dist, stay-in-STAT"],
          ["G12", "EQN", "Types 1–4 editors and solves"],
          ["G13", "Honesty", "MODE 2/4/6/7/8, SETUP 2, CONST/CONV"],
          ["G14", "Extras (optional)", "Overlay, Show keys, exe — not vs unit"],
        ]}
      />
      <Text tone="secondary">
        Source: `docs/prompts/validate-unit.md` · 29 Sep 2026.
      </Text>

      <H2>Launch a group</H2>
      <Row gap={8} wrap>
        {(
          [
            ["G1", "Arithmetic"],
            ["G2", "Fractions"],
            ["G3", "Powers"],
            ["G4", "Logs"],
            ["G5", "Trig"],
            ["G6", "Combo"],
            ["G7", "Calculus"],
            ["G8", "Pol/Rec"],
            ["G9", "Memory"],
            ["G10", "CALC/SOLVE"],
            ["G11", "STAT"],
            ["G12", "EQN"],
            ["G13", "Honesty"],
            ["G14", "Extras"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            variant="ghost"
            onClick={() => start(group(id))}
          >
            {id} {label}
          </Button>
        ))}
      </Row>

      <Row gap={8} wrap>
        <Pill active onClick={() => open("docs/prompts/validate-unit.md")}>
          validate-unit.md
        </Pill>
        <Pill onClick={() => open("docs/coverage.md")}>coverage.md</Pill>
        <Pill onClick={() => open("docs/principles.md")}>principles</Pill>
        <Pill onClick={() => open("issues.md")}>issues.md</Pill>
        <Pill onClick={() => open("docs/tech-issues.md")}>tech-issues</Pill>
      </Row>
    </Stack>
  );
}
