import { ParserContext, Token } from "./ParserContext";
import { Context, XBinaryOperation, XConstant, XList, XNode, XUnaryOperation, XVariable } from "./XNode";
import { Expression } from "./Expression";

export function parseExpression(pc: ParserContext): XNode {
  return parseTop(pc) ?? new XConstant(null);
}

function parseTop(pc: ParserContext): XNode | undefined {
  return parseLogic(pc)
}

function parseTopOrError(pc: ParserContext): XNode {
  const result = parseTop(pc);
  if (result) return result;
  pc.syntaxError();
}

const logicOperators = new Set(["&&", "||", "<", "<=", "==", ">=", ">", "!=", "===", "!===", "in", "!in"]);
const additiveOperators = new Set(["+", "-"]);
const multiplicativeOperators = new Set(["*", "/"]);

function parseBinaryOperation(pc: ParserContext,
                              operators: Set<string>,
                              getter: (pc: ParserContext) => XNode | undefined): XNode | undefined {
  let l = getter(pc);
  // no more work?
  if (!l) return undefined;

  // loop ofer all chained operations on our level:
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const t = pc.nextToken();
    if (t) {
      // there is a token
      if (t.type == "operator" && operators.has(t.value)) {
        // and it is our operation
        const r = getter(pc);
        if (!r) pc.syntaxError();
        // make operation new l-operand
        l = optimize(new XBinaryOperation(t.value, l, r));
        // continue checking
        continue;
      } else
        // token exists but does not suit our needs:
        pc.pushBack();
    }
    // if we get there, then no more work.
    break;
  }
  return l;
}

const emptyContext: Context = { variables: {} }

/**
 * Perform constexpr optimization
 * @param node
 */
function optimize(node: XNode): XNode {
  if (node.isConst && !(node instanceof XConstant)) {
    return new XConstant(node.calculate(emptyContext));
  }
  return node;
}


/**
 * lowest priority : exprA || exprB
 * @param pc
 */
function parseLogic(pc: ParserContext): XNode | undefined {
  return parseBinaryOperation(pc, logicOperators, pc => parseAdditive(pc));
}

/**
 * Medium priority, a + b - c
 * @param pc
 */
function parseAdditive(pc: ParserContext): XNode | undefined {
  return parseBinaryOperation(pc, additiveOperators, pc => parseMultiplicative(pc));
}

/**
 * high priority: a * b / c
 * @param pc
 */
function parseMultiplicative(pc: ParserContext): XNode | undefined {
  return parseBinaryOperation(pc, multiplicativeOperators, pc => parseUnary(pc));
}

/**
 * Top priority: unary operations, also constants, variables and brackets.
 * @param pc
 */
function parseUnary(pc: ParserContext): XNode | undefined {
  const t = pc.nextToken();
  if (!t) return undefined;
  switch (t.type) {
    case "constant":
      return new XConstant(t.value);
    case "name":
      return parseName(pc, t.value);
    case "operator":
      return createUnary(pc, t.value);
    case "listBracket":
      if( t.value == ']')
        pc.syntaxError("unbalanced closing list bracket");
      return parseList(pc);
    case "bracket": {
      // should always be an OPENING bracket
      if (t.value == "(") {
        const node = parseTopOrError(pc);
        const t = pc.nextToken();
        if (!t || t.type != "bracket") pc.syntaxError("missing closing bracket");
        return node;
      } else
        pc.syntaxError("unexpected ')'");
    }
  }
  pc.syntaxError("failed parse expression at position ");
}

/**
 * The name could be a variable, or predefined constant, e.g. 'true'. If it is a variable, adds it to the
 * list of [[variables]].
 * @param pc
 * @param name to check
 */
function parseName(pc: ParserContext, name: string): XNode {
  switch (name) {
    case "true":
      return new XConstant(true);
    case "false":
      return new XConstant(false);
  }
  pc.variables.add(name);
  return new XVariable(name);
}

function parseList(pc: ParserContext): XNode {
  const items = new Array<XNode>();
  let t: Token | undefined;
  // eslint-disable-next-line no-constant-condition
  while(true) {
    // not end of list, should be a value
    t = pc.nextToken();
    if (!t)
      pc.syntaxError("unterminated list");
    if( t.type == "listBracket" && t.value == "]")
      break; // end of list
    // comma delimiter:
    if( t.type != "comma" ) {
      // got to be an expression
      pc.pushBack();
      items.push(parseTopOrError(pc));
    }
    // else
    //   pc.syntaxError(`unexpected list syntax (unexpected '${t.value}')`);
  }
  return new XList(items);
}

/**
 * Create unary operator node from a name
 * @param pc
 * @param operator operator name as obtained from a token
 */
function createUnary(pc: ParserContext, operator: string): XNode {
  const operand = parseUnary(pc) ?? pc.syntaxError();
  switch (operator) {
    case "!":
    case "!!":
    case "-":
    case "+":
      return optimize(new XUnaryOperation(operator, operand));
  }
  throw new Expression.Exception("unsupported unary operator: " + operator);
}
