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

const PRE = `Follow docs/prompts/validate-unit.md exactly. Pairing / verification only. Workflow: validation session (walk + log) then separate issue-resolution chat — never fix in this chat. Do not implement leftovers, Phase 3, p4-tauri, LineIO, or packaging. Guide and scribe only: one case = one prompt (keys + what to compare on unit and Shevon). Stop. Ron runs both himself and reports findings only — not matching results or pass. Silence / ok / clear / next = pass that row. Never split unit vs Shevon into two prompts. Do NOT open/lock/CDP/click the browser or drive Shevon unless Ron explicitly asks. Form includes visuals: log R* for glyph/shape/window-chrome mismatches Ron notices. Do NOT dismiss those as pixel-perfect font out of scope. Template editing QA mandatory (DEL empty, ▲▼, nested templates, no IR leak). End sitting with a list of new R*/issue ids. Do not refile known leftovers. Update docs/prompts/validate-status.md when the sitting ends.`;

const G6 = `Follow docs/prompts/validate-unit.md G6 exactly.
Pairing only: G6 combinatorics and random.
One case = one prompt; Ron runs both; findings only (not results/pass).
Guide and scribe. Do not implement. Do not start Phase 3.
Update validate-status.md when done. After g5-resolve unless Ron says otherwise.`;

const G15 = `Follow docs/prompts/g15-nested.md exactly.
Pairing only: G15 nested COMP templates.
One case = one prompt; Ron runs both; findings only (not results/pass).
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
        <Button variant="primary" onClick={() => start(G6)}>
          Start G6 combo
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
        <Stat value="G6" label="Next" tone="warning" />
        <Stat value="G15" label="Later" />
      </Row>

      <Callout tone="warning" title="Validate → log → resolve later">
        One case prompt; Ron runs both; findings only. Log `R*` /
        issues, stop. Fixes later. G5 done (`R57` / `R59`). Next
        resolve: **`g5-resolve`** (`R55`–`R59`), then **G6**.
        **G15** later. Cursor:
        `docs/prompts/validate-status.md`. Do not implement here.
      </Callout>

      <H2>Groups (no overlap)</H2>
      <Table
        striped
        headers={["Id", "Group", "What is in here"]}
        rows={[
          ["G1", "Arithmetic and entry", "Sitting done — R36 ×10ˣ glyph dropped"],
          ["G2", "Fractions and display", "Sitting done"],
          ["G3", "Powers and roots", "Sitting + resolve — R44–R48"],
          ["G4", "Logs and exponentials", "Sitting + resolve + re-check — R49–R54"],
          ["G5", "Trigonometry and hyperbolic", "Sitting done — R57 / R59"],
          ["G6", "Combinatorics and random", "Next after g5-resolve"],
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
        Source: `docs/prompts/validate-unit.md` · G5 pair 15 Oct 2026.
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
