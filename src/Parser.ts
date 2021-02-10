import { ParserContext } from "./ParserContext";
import { XBinaryOperation, XConstant, XNode, XUnaryOperation, XVariable } from "./XNode";
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

const logicOperators = new Set(["&&", "||", "<", "<=", "==", ">=", ">", "!=", "===", "!==="]);
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
  while(true) {
    const t = pc.nextToken();
    if (t) {
      // there is a token
      if (t.type == "operator" && operators.has(t.value)) {
        // and it is our operation
        const r = getter(pc);
        if (!r) pc.syntaxError();
        // make operation new l-operand
        l = new XBinaryOperation(t.value, l, r);
        // continue checking
        continue;
      }
      else
        // token exists but does not suit our needs:
        pc.pushBack();
    }
    // if we get there, then no more work.
    break;
  }
  return l;
}


function parseLogic(pc: ParserContext): XNode | undefined {
  return parseBinaryOperation(pc, logicOperators, pc => parseAdditive(pc));
}

function parseAdditive(pc: ParserContext): XNode | undefined {
  return parseBinaryOperation(pc, additiveOperators, pc => parseMultiplicative(pc));
}


function parseMultiplicative(pc: ParserContext): XNode | undefined {
  return parseBinaryOperation(pc, multiplicativeOperators, pc => parseUnary(pc));
}

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
    case "bracket": {
      const node = parseTopOrError(pc);
      const t = pc.nextToken();
      if( !t || t.type != "bracket" ) pc.syntaxError();
      return node;
    }

  }
  this.syntaxError("failed parse expression at position ");
}

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

function createUnary(pc: ParserContext, operator: string): XNode {
  const operand = parseUnary(pc) ?? pc.syntaxError();
  switch (operator) {
    case "!":
    case "!!":
    case "-":
    case "+":
      return new XUnaryOperation(operator, operand);
  }
  throw new Expression.Exception("unsupported unary operator: " + operator);
}


// export function parseOperation(pc: ParserContext, operators: string[]): XNode | undefined {
//   const
// }