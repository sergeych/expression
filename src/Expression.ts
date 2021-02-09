import { ParserContext } from "./ParserContext";
import { parseExpression } from "./Parser";
import { Context, ValueType, XNode } from "./XNode";

/**
 * Expressions parser/compiler/calculator.
 *
 * Course of actions:
 *
 * - construct expressions
 * - check detected [[variables]]
 * - [[calculate]] providing variables
 */
export class Expression {

  /**
   * General exceptino
   */
  static Exception = class extends Error {};
  /**
   * Not used at the moment
   */
  static NotFound = class extends Expression.Exception {};
  /**
   * expresstion part type prevent calculations, e.g. "false * 3"
   */
  static TypeError = class extends Expression.Exception {};

  /**
   * Error while parsing the expression
   */
  static SyntaxError = class extends Expression.Exception {
    constructor(readonly row: number,readonly column: number, text = "syntax error") {
      super(`(${row}:${column}) ${text}`);
    }
  };

  private rootNode: XNode;

  /**
   * List of all detected variables
   */
  readonly variables: string[];

  /**
   * Parse specified expression, precompile and set [[variables]].
   * @param source expression to parse
   */
  constructor(readonly source: string) {
    const pc = new ParserContext(source);
    this.rootNode = parseExpression(pc);
    this.variables = [...pc.variables];
    Object.freeze(this.variables);
  }

  /**
   * Caclulate the expression using provided value for variables. Note that missing variables are considered
   * having value of `null` and processed as usual.
   *
   * @param variables to use in calculation.
   */
  caclulate(variables: Record<string,ValueType> = {}): ValueType {
    return this.rootNode.calculate({variables});
  }
}