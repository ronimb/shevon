/**
 * A small, dependency-free recursive-descent parser for the calculator's
 * canonical expression form.
 *
 * The frontend "template language" (frac(a,b), sqrt(x), sin(x), nCr(n,r), …)
 * is the intermediate representation produced by the key handlers. The
 * evaluator lowers that IR into this canonical form — plain function calls,
 * numbers, identifiers and the operators + - * / ** — and then hands it here
 * to be turned into an AST.
 *
 * This replaces the previous `new Function(...)` evaluation strategy: no code
 * is ever generated or executed, and the intermediate AST can be asserted
 * directly in tests.
 */

export type BinaryOp = '+' | '-' | '*' | '/' | '**';
export type UnaryOp = '+' | '-';

export type AstNode =
  | { type: 'num'; value: number }
  | { type: 'var'; name: string }
  | { type: 'call'; name: string; args: AstNode[] }
  | { type: 'unary'; op: UnaryOp; operand: AstNode }
  | { type: 'binary'; op: BinaryOp; left: AstNode; right: AstNode };

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

type Token =
  | { type: 'num'; value: number; pos: number }
  | { type: 'ident'; value: string; pos: number }
  | { type: 'op'; value: BinaryOp; pos: number }
  | { type: 'lparen'; pos: number }
  | { type: 'rparen'; pos: number }
  | { type: 'comma'; pos: number };

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const DIGIT = /[0-9]/;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const c = input[i];

    // Whitespace is insignificant.
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++;
      continue;
    }

    // Numbers: digits with an optional single decimal point.
    if (DIGIT.test(c) || (c === '.' && DIGIT.test(input[i + 1] ?? ''))) {
      const start = i;
      let seenDot = false;
      while (i < n && (DIGIT.test(input[i]) || (input[i] === '.' && !seenDot))) {
        if (input[i] === '.') seenDot = true;
        i++;
      }
      const raw = input.slice(start, i);
      const value = Number(raw);
      if (Number.isNaN(value)) throw new ParseError(`Invalid number "${raw}"`);
      tokens.push({ type: 'num', value, pos: start });
      continue;
    }

    // Identifiers: letters, digits, underscore. Covers pi, e, Ans, X, __sin,
    // stat_sigx2, NaN, Infinity, single-letter variables, etc.
    if (IDENT_START.test(c)) {
      const start = i;
      while (i < n && IDENT_PART.test(input[i])) i++;
      tokens.push({ type: 'ident', value: input.slice(start, i), pos: start });
      continue;
    }

    // Exponent operator (must be checked before '*').
    if (c === '*' && input[i + 1] === '*') {
      tokens.push({ type: 'op', value: '**', pos: i });
      i += 2;
      continue;
    }

    if (c === '+' || c === '-' || c === '*' || c === '/') {
      tokens.push({ type: 'op', value: c as BinaryOp, pos: i });
      i++;
      continue;
    }

    if (c === '(') {
      tokens.push({ type: 'lparen', pos: i });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'rparen', pos: i });
      i++;
      continue;
    }
    if (c === ',') {
      tokens.push({ type: 'comma', pos: i });
      i++;
      continue;
    }

    throw new ParseError(`Unexpected character "${c}" at position ${i}`);
  }

  return tokens;
}

/**
 * Recursive-descent / precedence-climbing parser.
 *
 * Precedence (low → high), matching the JavaScript semantics the previous
 * `new Function` implementation relied on:
 *   1. + -            (left-associative)
 *   2. * /            (left-associative)
 *   3. unary + -
 *   4. **             (right-associative, binds tighter than unary on its left)
 *   5. primary        (numbers, identifiers, calls, parentheses)
 */
class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++];
  }

  parse(): AstNode {
    const node = this.parseAdditive();
    const rest = this.peek();
    if (rest) throw new ParseError(`Unexpected token at position ${rest.pos}`);
    return node;
  }

  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();
    while (true) {
      const t = this.peek();
      if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
        this.next();
        const right = this.parseMultiplicative();
        left = { type: 'binary', op: t.value, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();
    while (true) {
      const t = this.peek();
      if (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
        this.next();
        const right = this.parseUnary();
        left = { type: 'binary', op: t.value, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseUnary(): AstNode {
    const t = this.peek();
    if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
      this.next();
      const operand = this.parseUnary();
      return { type: 'unary', op: t.value, operand };
    }
    return this.parsePower();
  }

  private parsePower(): AstNode {
    const base = this.parsePrimary();
    const t = this.peek();
    if (t && t.type === 'op' && t.value === '**') {
      this.next();
      // Right-associative; allow a unary exponent (e.g. 2**-3).
      const exponent = this.parseUnary();
      return { type: 'binary', op: '**', left: base, right: exponent };
    }
    return base;
  }

  private parsePrimary(): AstNode {
    const t = this.next();
    if (!t) throw new ParseError('Unexpected end of expression');

    if (t.type === 'num') {
      return { type: 'num', value: t.value };
    }

    if (t.type === 'ident') {
      // Function call if immediately followed by '('.
      const nt = this.peek();
      if (nt && nt.type === 'lparen') {
        this.next(); // consume '('
        const args = this.parseArgs();
        return { type: 'call', name: t.value, args };
      }
      return { type: 'var', name: t.value };
    }

    if (t.type === 'lparen') {
      const inner = this.parseAdditive();
      const close = this.next();
      if (!close || close.type !== 'rparen') {
        throw new ParseError('Expected ")"');
      }
      return inner;
    }

    throw new ParseError(`Unexpected token at position ${t.pos}`);
  }

  private parseArgs(): AstNode[] {
    const args: AstNode[] = [];
    // Zero-argument call, e.g. __ranhash().
    const first = this.peek();
    if (first && first.type === 'rparen') {
      this.next();
      return args;
    }
    while (true) {
      args.push(this.parseAdditive());
      const t = this.next();
      if (!t) throw new ParseError('Expected "," or ")"');
      if (t.type === 'rparen') break;
      if (t.type !== 'comma') throw new ParseError(`Expected "," or ")" at position ${t.pos}`);
    }
    return args;
  }
}

/** Parse a canonical expression string into an AST. */
export function parse(input: string): AstNode {
  return new Parser(tokenize(input)).parse();
}
