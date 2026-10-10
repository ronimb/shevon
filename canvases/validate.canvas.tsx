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

const PRE = `Follow docs/prompts/validate-unit.md exactly. Pairing / verification only. Workflow: validation session (walk + log) then separate issue-resolution chat — never fix in this chat. Do not implement leftovers, Phase 3, p4-tauri, LineIO, or packaging. Default: guide and scribe only — name one row, tell Ron what to press on the unit then on Shevon, wait for his reports, compare and log. Do NOT open/lock/CDP/click the browser or drive Shevon unless Ron explicitly asks. Form includes visuals: log R* for glyph/shape/window-chrome mismatches Ron notices (π serif vs straight, ×10ˣ paint, caret, AC blank vs 0). Do NOT dismiss those as pixel-perfect font out of scope. Template editing QA mandatory (DEL empty, ▲▼, nested templates, no IR leak). End sitting with a list of new R*/issue ids. Do not refile known leftovers. Update docs/prompts/validate-status.md when the sitting ends.`;

const G4 = `Follow docs/prompts/g4-pair.md exactly.
Pairing only: G4 logs and exponentials.
Guide and scribe. Do not implement. Do not start Phase 3.
Update validate-status.md when done.`;

const G15 = `Follow docs/prompts/g15-nested.md exactly.
Pairing only: G15 nested COMP templates.
Guide and scribe. Do not implement. Do not re-walk G2/G3.
Do not start Phase 3. Update validate-status.md when done.`;

const group = (id: string) =>
  `${PRE} Start with ${id} only. Finish that group, then stop. Summarize new R*/issue ids; do not start fixes.`;

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
          Workflow: validate → log → resolve in a later chat.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        <Button variant="primary" onClick={() => start(G4)}>
          Start G4 logs
        </Button>
        <Button variant="secondary" onClick={() => start(G15)}>
          Start G15 nested
        </Button>
        <Button
          variant="ghost"
          onClick={() => open("canvases/g2-recheck.canvas.tsx")}
        >
          G2 re-check checklist
        </Button>
        <Button
          variant="ghost"
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
        <Stat value="15" label="Groups" />
        <Stat value="G4" label="Next sitting" tone="warning" />
        <Stat value="G15" label="Nested (later)" />
      </Row>

      <Callout tone="warning" title="Validate → log → resolve later">
        Pairing only: walk one group, log `R*` / issues, stop. Fixes
        are a separate kickoff after the sitting. G2/G3 closed.
        Nested COMP cases are **G15**. Next: G4.
        Cursor: `docs/prompts/validate-status.md`. Do not implement here.
      </Callout>

      <H2>Groups (no overlap)</H2>
      <Table
        striped
        headers={["Id", "Group", "What is in here"]}
        rows={[
          ["G1", "Arithmetic and entry", "Sitting done — R36 ×10ˣ glyph dropped"],
          ["G2", "Fractions and display", "Sitting done"],
          ["G3", "Powers and roots", "Sitting + resolve — R44–R48"],
          ["G4", "Logs and exponentials", "Next — incl. log/10^ of fraction"],
          ["G5", "Trigonometry and hyperbolic", "incl. sin/Abs of fraction"],
          ["G6", "Combinatorics and random", "x! nPr nCr Ran# RanInt#"],
          ["G7", "Calculus templates", "incl. frac in ∫ / d/dx"],
          ["G8", "Polar and rectangular", "Pol Rec + X,Y"],
          ["G9", "Memory", "STO RCL A–F X Y M CLR"],
          ["G10", "CALC and SOLVE", "Prompts, errors, Continue"],
          ["G11", "STAT", "Types, FREQ, Dist, stay-in-STAT"],
          ["G12", "EQN", "Types 1–4 editors and solves"],
          ["G13", "Honesty", "MODE 2/4/6/7/8, SETUP 2, CONST/CONV"],
          ["G14", "Extras (after G1)", "Sitting and resolution done"],
          ["G15", "Nested COMP templates", "Untested — frac under √, etc."],
        ]}
      />
      <Text tone="secondary">
        Source: `docs/prompts/validate-unit.md` · g3-resolve 10 Oct 2026.
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
