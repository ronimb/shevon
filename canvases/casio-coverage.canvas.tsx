import {
  Callout,
  CollapsibleSection,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  UsageBar,
  useCanvasState,
  useMemo,
} from "cursor/canvas";

type Status = "done" | "partial" | "missing";
type Area =
  | "Modes"
  | "Setup"
  | "Input"
  | "Memory"
  | "Functions"
  | "CALC / SOLVE"
  | "STAT"
  | "EQN"
  | "CMPLX"
  | "BASE-N"
  | "MATRIX"
  | "TABLE"
  | "VECTOR"
  | "Constants"
  | "Errors"
  | "Platform";

interface Feature {
  area: Area;
  name: string;
  manual: string;
  status: Status;
  inCode: string;
  gap: string;
}

const FEATURES: Feature[] = [
  { area: "Modes", name: "COMP", manual: "E-5 N1", status: "done", inCode: "Default calcMode; full expression path", gap: "LineIO, Ran# 3-digit, DMS glyphs, ERROR jump-to-token" },
  { area: "Modes", name: "CMPLX", manual: "E-5 N2", status: "missing", inCode: "Menu row only; CMPLX indicator always dim", gap: "No i, ∠, arg, Conjg, or polar/rect format" },
  { area: "Modes", name: "STAT", manual: "E-5 N3, E-22", status: "partial", inCode: "Type menu, editor, Sum/Var/MinMax/Reg", gap: "FREQ, Dist, edit Ins/Del-A, STAT indicator vs COMP mix" },
  { area: "Modes", name: "BASE-N", manual: "E-5 N4, E-26", status: "missing", inCode: "Menu row; selecting 4 returns to COMP", gap: "DEC/HEX/BIN/OCT, and/or/xor/xnor, Not, Neg" },
  { area: "Modes", name: "EQN", manual: "E-5 N5, E-28", status: "partial", inCode: "Menu shown; only option 3 (quadratic) runs", gap: "2-unk, 3-unk, cubic; complex quadratic roots" },
  { area: "Modes", name: "MATRIX", manual: "E-5 N6, E-29", status: "missing", inCode: "Menu row only", gap: "MatA/B/C, Dim, det, Trn, inverse, MatAns" },
  { area: "Modes", name: "TABLE", manual: "E-5 N7, E-32", status: "missing", inCode: "Menu row only", gap: "f(x), Start/End/Step, 30-row cap, Insufficient MEM" },
  { area: "Modes", name: "VECTOR", manual: "E-5 N8, E-33", status: "missing", inCode: "Menu row only", gap: "VctA/B/C, dot, cross, Abs, VctAns" },

  { area: "Setup", name: "MthIO / LineIO", manual: "E-5 1/2", status: "partial", inCode: "Always Math indicator; natural HTML input", gap: "LineIO is a no-op that returns to COMP; no overwrite cursor / INS" },
  { area: "Setup", name: "Deg / Rad / Gra", manual: "E-6 3/4/5", status: "done", inCode: "SETUP 3–5; D/R/G status; trig uses angleMode", gap: "" },
  { area: "Setup", name: "Fix / Sci / Norm", manual: "E-6 6/7/8", status: "done", inCode: "SETUP 6–8 + prompts; FIX/SCI indicators; format.ts", gap: "" },
  { area: "Setup", name: "Display digits", manual: "E-38", status: "done", inCode: "Fix/Sci/Norm via format.ts; 10-digit Norm 2; Norm 1 at 1e-2", gap: "" },
  { area: "Setup", name: "ab/c vs d/c", manual: "E-6 c1/c2", status: "done", inCode: "SETUP page 2 mixedFraction; S⇔D still toggles fraction vs decimal", gap: "" },
  { area: "Setup", name: "STAT FREQ ON/OFF", manual: "E-6 c4", status: "missing", inCode: "statFrequencyEnabled exists, never set true", gap: "SETUP page 2 not implemented" },
  { area: "Setup", name: "Dot / Comma", manual: "E-6 c5", status: "missing", inCode: "Always dot", gap: "Result decimal separator" },
  { area: "Setup", name: "Contrast", manual: "E-3, E-6 c6", status: "missing", inCode: "Not applicable (photo overlay + HTML LCD)", gap: "Permanently skip — hardware contrast, not LCD element parity" },

  { area: "Input", name: "Natural templates", manual: "E-8", status: "done", inCode: "frac, mix, sqrt, pwr, int, diff, Σ, log_b, abs…", gap: "Height/nesting limits not enforced" },
  { area: "Input", name: "INS wrap-as-argument", manual: "E-9", status: "partial", inCode: "frac/nPr/root wrap preceding operand", gap: "No general SHIFT DEL (INS) for arbitrary functions" },
  { area: "Input", name: "99-byte input limit", manual: "E-7", status: "missing", inCode: "Unlimited string", gap: "Cursor-k warning at 10 bytes remaining" },
  { area: "Input", name: "Implicit multiply", manual: "E-7", status: "partial", inCode: "Regex after rewrite: 2π, 2sin, )(", gap: "Edge cases vs Casio priority (omitted × is 7th)" },
  { area: "Input", name: "Priority sequence", manual: "E-8", status: "partial", inCode: "JS ** / * / + after template rewrite", gap: "Unary minus vs x², metric/STAT postfix, AND/OR" },
  { area: "Input", name: "Percent", manual: "E-11 SHIFT (", status: "done", inCode: "SHIFT ( inserts % → /100", gap: "Confirm Casio percent-of semantics on +/−" },
  { area: "Input", name: "Sexagesimal ° ′ ″", manual: "E-11", status: "partial", inCode: "d°m°s° rewrite + result toggle", gap: "All three parts display as °, not ° ′ ″" },
  { area: "Input", name: "Multi-statements :", manual: "E-11 ALPHA 7", status: "missing", inCode: "ALPHA CALC inserts =", gap: "Colon chain + Disp indicator" },
  { area: "Input", name: "Engineering notation", manual: "E-11 ENG", status: "done", inCode: "ENG / SHIFT ENG step displayed result; formatEngineering", gap: "" },
  { area: "Input", name: "Calculation history replay", manual: "E-12", status: "done", inCode: "LCD ▲/▼ replayIndex in COMP; side pane kept as extra", gap: "" },

  { area: "Memory", name: "Ans", manual: "E-12", status: "done", inCode: "ans state; persisted localStorage", gap: "" },
  { area: "Memory", name: "Variables A–F, X, Y", manual: "E-13", status: "done", inCode: "ALPHA + keys; STO/RCL; persisted", gap: "" },
  { area: "Memory", name: "Independent M", manual: "E-13", status: "done", inCode: "M+ / SHIFT M−; M indicator", gap: "" },
  { area: "Memory", name: "CLR Setup / Memory / All", manual: "E-2, E-13", status: "done", inCode: "SHIFT 9 CLR_MENU 1/2/3", gap: "" },

  { area: "Functions", name: "π and e", manual: "E-13", status: "done", inCode: "SHIFT EXP → π; ALPHA EXP → e", gap: "Display vs 15-digit internal values" },
  { area: "Functions", name: "sin cos tan + inverse", manual: "E-13", status: "done", inCode: "Keys + SHIFT; angleMode conversion", gap: "Input-range Math ERROR from E-38" },
  { area: "Functions", name: "Hyperbolic menu", manual: "E-13 hyp", status: "done", inCode: "hyp menu 1–6; evaluator sinh…atanh", gap: "" },
  { area: "Functions", name: "Abs", manual: "E-15 SHIFT hyp", status: "done", inCode: "SHIFT hyp inserts abs(‸)", gap: "" },
  { area: "Functions", name: "° r g conversions", manual: "E-14 SHIFT DRG", status: "missing", inCode: "None", gap: "1G(DRG′) menu" },
  { area: "Functions", name: "10^ and e^", manual: "E-14", status: "done", inCode: "SHIFT log / SHIFT ln templates", gap: "" },
  { area: "Functions", name: "log, log_b, ln", manual: "E-14", status: "done", inCode: "log10, log_b, ln templates", gap: "LineIO log(a,b) comma form" },
  { area: "Functions", name: "x² x³ x^ √ ³√ x⁻¹", manual: "E-14", status: "done", inCode: "sqr, cube, ^, sqrt, root, SHIFT x⁻¹", gap: "Consecutive x² ignored on Casio — not matched" },
  { area: "Functions", name: "∫ integration", manual: "E-14, E-15", status: "partial", inCode: "Adaptive Gauss–Kronrod G7–K15; int(f,a,b,x)", gap: "Visual: a/b sit left of ∫; Casio is b above / a below the symbol, then f(x)dx to the right. Time Out Error, COMP-only rule" },
  { area: "Functions", name: "d/dx derivative", manual: "E-14", status: "done", inCode: "Central difference + Richardson; goldens pin d/dx x²|₃=6", gap: "Time Out Error not implemented" },
  { area: "Functions", name: "Σ summation", manual: "E-14", status: "partial", inCode: "Integer loop; end capped at start+1000", gap: "±1e10 bounds; Pol/∫/d/dx/Σ nested ban" },
  { area: "Functions", name: "Pol / Rec", manual: "E-14", status: "partial", inCode: "SHIFT + / −; writes X,Y; returns r or x only", gap: "Dual-line r,θ / X,Y result screen" },
  { area: "Functions", name: "x!", manual: "E-15", status: "done", inCode: "SHIFT x⁻¹; factorial() up to 170", gap: "Casio max 69; Math ERROR above" },
  { area: "Functions", name: "Ran# / RanInt#", manual: "E-15", status: "partial", inCode: "SHIFT . = Ran#; ALPHA . = RanInt#(a,b)", gap: "Ran# is Math.random(), not Casio 3-digit 0.000–0.999" },
  { area: "Functions", name: "nPr / nCr", manual: "E-18", status: "done", inCode: "SHIFT × / ÷ wrap operand", gap: "Range checks from E-39" },
  { area: "Functions", name: "Rnd", manual: "E-15", status: "done", inCode: "SHIFT 0 → Rnd(; __rnd uses roundToFormat", gap: "" },

  { area: "CALC / SOLVE", name: "CALC", manual: "E-19", status: "partial", inCode: "CALC key prompts every A–F/M/X/Y in the expression", gap: "Casio CALC UX, equalities, CMPLX CALC, Linear input during prompt" },
  { area: "CALC / SOLVE", name: "SOLVE", manual: "E-20 SHIFT CALC", status: "partial", inCode: "Newton–Raphson 40 steps on X", gap: "Initial-guess prompt, L−R residual, Continue, Variable ERROR, Can’t Solve" },

  { area: "STAT", name: "Eight calculation types", manual: "E-22", status: "done", inCode: "1-VAR through 1/X; linear transforms + quadratic Cramer's", gap: "Numeric match vs Casio on the E-24 sample" },
  { area: "STAT", name: "Stat Editor", manual: "E-23", status: "partial", inCode: "Grid, cursor, = advances cell, DEL edits cell", gap: "80/40/26 row caps; Ins; Del-A; no STO/M+ in editor" },
  { area: "STAT", name: "FREQ column", manual: "E-23", status: "missing", inCode: "Default freq=1; UI gated off", gap: "SETUP STAT ON" },
  { area: "STAT", name: "Sum / Var / MinMax", manual: "E-23", status: "done", inCode: "SHIFT 1 STAT menu; inserts symbols into COMP", gap: "On Casio you recall while STAT stays active" },
  { area: "STAT", name: "Reg + estimates", manual: "E-24", status: "done", inCode: "A B r C; __yhat __xhat __xhat1/2", gap: "Quadratic r not shown (Casio uses A B C m1 m2 n)" },
  { area: "STAT", name: "Normal Dist P Q R 't", manual: "E-25", status: "missing", inCode: "Dist appears on STAT_RESULT; submenu empty", gap: "Standard normal probabilities" },

  { area: "EQN", name: "2-unknown linear", manual: "E-28 1", status: "missing", inCode: "Menu text only", gap: "Coefficient editor + X,Y solutions" },
  { area: "EQN", name: "3-unknown linear", manual: "E-28 2", status: "missing", inCode: "Menu text only", gap: "X,Y,Z" },
  { area: "EQN", name: "Quadratic", manual: "E-28 3", status: "partial", inCode: "a,b,c editor; real roots; ▲▼ between X1/X2", gap: "No a/b/c labels on cells; complex roots with √ form; fraction coeffs" },
  { area: "EQN", name: "Cubic", manual: "E-28 4", status: "missing", inCode: "Menu text only", gap: "Up to three real/complex roots" },

  { area: "CMPLX", name: "a+bi and r∠θ I/O", manual: "E-18", status: "missing", inCode: "i / ∠ unused", gap: "Full CMPLX mode" },
  { area: "CMPLX", name: "arg / Conjg / format cmds", manual: "E-19", status: "missing", inCode: "None", gap: "SHIFT 2 CMPLX menu" },

  { area: "BASE-N", name: "DEC HEX BIN OCT", manual: "E-26", status: "missing", inCode: "None", gap: "16-bit bin / 32-bit others; integer-only" },
  { area: "BASE-N", name: "Logic and Neg", manual: "E-27", status: "missing", inCode: "None", gap: "and or xor xnor Not Neg; d/h/b/o prefixes" },

  { area: "MATRIX", name: "MatA/B/C up to 3×3", manual: "E-29", status: "missing", inCode: "None", gap: "Editor, scalar, det, Trn, inverse, Abs, powers" },
  { area: "TABLE", name: "f(x) number table", manual: "E-32", status: "missing", inCode: "None", gap: "Start End Step; X overwritten; Insufficient MEM" },
  { area: "VECTOR", name: "2D/3D VctA/B/C", manual: "E-33", status: "missing", inCode: "None", gap: "Add, scalar, dot, cross, Abs, angle example" },

  { area: "Constants", name: "40 scientific constants", manual: "E-35 SHIFT 7", status: "missing", inCode: "None", gap: "CODATA 2007 two-digit catalog" },
  { area: "Constants", name: "40 metric conversions", manual: "E-37 SHIFT 8", status: "missing", inCode: "None", gap: "NIST SP 811 pairs; banned in BASE-N and TABLE" },

  { area: "Errors", name: "Math ERROR / Syntax ERROR", manual: "E-40", status: "partial", inCode: "LCD strings; NaN/Infinity → Math ERROR", gap: "d/e jump to error; AC clears expression on Casio" },
  { area: "Errors", name: "Stack / Argument / Dimension", manual: "E-40", status: "missing", inCode: "None", gap: "Needed once MATRIX/VECTOR/deep nests exist" },
  { area: "Errors", name: "Variable / Can’t Solve / Time Out", manual: "E-41", status: "missing", inCode: "SOLVE fails as Syntax ERROR", gap: "Proper SOLVE and ∫/d/dx diagnostics" },
  { area: "Errors", name: "Calculation range ±1×10^99", manual: "E-38", status: "partial", inCode: "±10¹⁰⁰ → Math ERROR; factorial still to 170", gap: "Per-function ranges from E-38–39; Casio factorial max 69" },

  { area: "Platform", name: "Photo overlay + hitboxes", manual: "—", status: "done", inCode: "Absolute keys; triple-click calibration; calculator_new.png committed", gap: "" },
  { area: "Platform", name: "PC keyboard", manual: "—", status: "partial", inCode: "Enter, arrows, Shift/Alt, S/C/T/L/R/Q/A", gap: "Letter keys steal typing; Shift is hold vs toggle mismatch" },
  { area: "Platform", name: "History / LaTeX pane", manual: "—", status: "done", inCode: "50 items, Load, key-sequence reconstruction", gap: "Not Casio behavior; keep as extra" },
  { area: "Platform", name: "Electron + Pages + PWA", manual: "—", status: "partial", inCode: "Scripts and workflow present; README rewritten; Gemini/mathjs deps removed", gap: "Verify portable exe, Pages deploy, and PWA install end-to-end" },
  { area: "Platform", name: "Tests", manual: "E-16 examples", status: "partial", inCode: "28 golden + 16 parser = 44", gap: "Remaining numbered sample operations in the PDF" },
];

const AREAS: Array<Area | "All"> = [
  "All",
  "Modes",
  "Setup",
  "Input",
  "Memory",
  "Functions",
  "CALC / SOLVE",
  "STAT",
  "EQN",
  "CMPLX",
  "BASE-N",
  "MATRIX",
  "TABLE",
  "VECTOR",
  "Constants",
  "Errors",
  "Platform",
];

const STATUS_LABEL: Record<Status, string> = {
  done: "Done",
  partial: "Partial",
  missing: "Missing",
};

function toneFor(status: Status): "success" | "warning" | "danger" {
  if (status === "done") return "success";
  if (status === "partial") return "warning";
  return "danger";
}

export default function CasioCoverage() {
  const [statusFilter, setStatusFilter] = useCanvasState<Status | "all">(
    "coverage-status",
    "all",
  );
  const [areaFilter, setAreaFilter] = useCanvasState<Area | "All">(
    "coverage-area",
    "All",
  );

  const counts = useMemo(() => {
    const done = FEATURES.filter((f) => f.status === "done").length;
    const partial = FEATURES.filter((f) => f.status === "partial").length;
    const missing = FEATURES.filter((f) => f.status === "missing").length;
    return { done, partial, missing, total: FEATURES.length };
  }, []);

  const rows = useMemo(() => {
    return FEATURES.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (areaFilter !== "All" && f.area !== areaFilter) return false;
      return true;
    });
  }, [statusFilter, areaFilter]);

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Casio fx-991ES PLUS coverage</H1>
        <Text tone="secondary">
          Feature-by-feature map of the official user guide against the
          `Calculator.tsx` shell and the `parser` / `evaluator` engine.
          Status is about behavior, not whether a menu label exists.
        </Text>
      </Stack>

      <Row gap={24} align="end">
        <Stat value={String(counts.done)} label="Done" tone="success" />
        <Stat value={String(counts.partial)} label="Partial" tone="warning" />
        <Stat value={String(counts.missing)} label="Missing" tone="danger" />
        <Stat value={`${counts.done}/${counts.total}`} label="Fully implemented" />
      </Row>

      <UsageBar
        total={counts.total}
        topLeftLabel="Implementation mix across the manual"
        topRightLabel={`${counts.done} done · ${counts.partial} partial · ${counts.missing} missing`}
        segments={[
          { id: "done", value: counts.done, color: "green" },
          { id: "partial", value: counts.partial, color: "yellow" },
          { id: "missing", value: counts.missing, color: "red" },
        ]}
      />

      <Callout tone="info" title="How to read status">
        Done means a user can perform the Casio operation from the overlay
        keys and get a plausible result. Partial means the menu, evaluator
        helper, or a subset exists but the Casio procedure is incomplete or
        wrong. Missing means the MODE/SETUP row is decorative or the key is
        a no-op / literal text dump.
      </Callout>

      <H2>Filter</H2>
      <Row gap={8} wrap>
        <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
          All statuses
        </Pill>
        <Pill active={statusFilter === "done"} onClick={() => setStatusFilter("done")}>
          Done
        </Pill>
        <Pill
          active={statusFilter === "partial"}
          onClick={() => setStatusFilter("partial")}
        >
          Partial
        </Pill>
        <Pill
          active={statusFilter === "missing"}
          onClick={() => setStatusFilter("missing")}
        >
          Missing
        </Pill>
      </Row>
      <Row gap={8} wrap>
        {AREAS.map((area) => (
          <span key={area}>
            <Pill
              size="sm"
              active={areaFilter === area}
              onClick={() => setAreaFilter(area)}
            >
              {area}
            </Pill>
          </span>
        ))}
      </Row>

      <H2>
        {areaFilter === "All" ? "All areas" : areaFilter}
        {statusFilter !== "all" ? ` · ${STATUS_LABEL[statusFilter]}` : ""}
        {` · ${rows.length}`}
      </H2>
      <Table
        headers={["Area", "Feature", "Manual", "Status", "In the emulator", "Gap"]}
        columnAlign={["left", "left", "left", "left", "left", "left"]}
        rowTone={rows.map((f) => toneFor(f.status))}
        rows={rows.map((f) => [
          f.area,
          f.name,
          f.manual,
          STATUS_LABEL[f.status],
          f.inCode,
          f.gap || "—",
        ])}
        striped
        stickyHeader
        emptyMessage="No features match this filter."
      />

      <H2>Casio key behavior already in COMP</H2>
      <Text>
        SHIFT and ALPHA are latched toggles on the overlay (momentary hold
        on the PC keyboard). After a shifted function the emulator usually
        clears SHIFT. Closing parentheses of sin/log-style functions can be
        omitted at `=` the same way Casio does.
      </Text>
      <Table
        headers={["Key", "Normal", "SHIFT", "ALPHA"]}
        rows={[
          ["CALC (top-left)", "CALC prompts", "SOLVE for X", "inserts ="],
          ["∫", "int(f, a, b, x)", "d/dx template", "—"],
          ["x⁻¹", "^-1", "x!", "—"],
          ["log□", "log_b", "Σ (defaults 0..10)", "—"],
          ["a b/c", "frac wrap", "mixed fraction", "—"],
          ["√", "sqrt", "cube root", "—"],
          ["x²", "²", "³", "—"],
          ["xⁿ", "^( ) or pwr", "nth root", "—"],
          ["log / ln", "log10 / ln", "10^ / e^", "—"],
          ["(-) °′″ hyp", "unary − / ° / hyp menu", "Abs", "A / B / C"],
          ["sin cos tan", "trig(", "inverse", "D / E / F"],
          ["RCL", "recall standby", "STO standby", "—"],
          ["ENG", "ENG-step result", "SHIFT ENG opposite", "—"],
          ["( )", "( )", "%  ,", ") is also X"],
          ["S⇔D", "fraction ↔ decimal", "—", "Y"],
          ["M+", "add to M", "M−", "M"],
          ["× ÷", "multiply divide", "nPr nCr", "—"],
          ["+ −", "add subtract", "Pol Rec", "—"],
          ["×10ˣ", "scientific exp", "π", "e"],
          ["MODE", "mode menu", "SETUP", "—"],
          ["1 (in STAT)", "digit", "STAT result menu", "—"],
        ]}
        striped
      />

      <H3>Evaluator internals worth knowing</H3>
      <CollapsibleSection title="How expressions become numbers" defaultOpen>
        <Stack gap={8}>
          <Text>
            Internal form is a string with a `‸` cursor. Templates look like
            `frac(1,2)`, `int(ln(X),1,e,x)`, `Σ(X+1,x,1,5)`. The evaluator
            lowers the template IR to a canonical form, `src/parser.ts`
            tokenizes and parses it into a typed AST, and the evaluator walks
            that AST — no `new Function`, no code generation.
          </Text>
          <Text tone="secondary">
            Integration is adaptive Gauss–Kronrod (G7–K15). Differentiation
            is a central difference plus Richardson. STAT regressions for
            non-linear types are linearized with log/reciprocal transforms.
            Quadratic STAT uses Cramer's rule on the 3×3 normal equations.
          </Text>
        </Stack>
      </CollapsibleSection>
      <CollapsibleSection title="STAT and EQN flow">
        <Stack gap={8}>
          <Text>
            MODE 3 → type 1–8 → data grid. AC from STAT returns to COMP
            without deleting data in memory (statType stays set, STAT
            indicator stays on). SHIFT 1 opens the STAT recall menu while
            `statType !== null`.
          </Text>
          <Text tone="secondary">
            MODE 5 → only 3 is handled. Coefficients are decimal strings.
            Negative discriminant shows "No real solutions" instead of
            complex X1/X2 as on E-29.
          </Text>
        </Stack>
      </CollapsibleSection>
      <CollapsibleSection title="Display vs Casio LCD">
        <Stack gap={8}>
          <Text>
            Input uses HTML (stacked fractions, ∫ bounds, Σ bounds) with
            standard browser fonts — that is the intended LCD, not a gap
            to close with a pixelated font. Visual fidelity still has to be
            checked on already-shipped templates: same elements in the same
            relative locations, same timing and I/O. Known miss: ∫ currently
            places a/b to the left of the integral sign; Casio is ∫ with b
            above / a below the symbol, then f(x)dx to the right.
          </Text>
          <Text tone="secondary">
            Results use a 10-digit budget or scientific mantissa×10^n. S⇔D
            uses a continued-search `toFraction` (d ≤ 1000), not Casio's √/π
            exact forms. π÷6 will not show as (1/6)π.
          </Text>
        </Stack>
      </CollapsibleSection>
    </Stack>
  );
}
