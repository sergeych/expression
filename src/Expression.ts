import { ParserContext } from "./ParserContext";
import { parseExpression } from "./Parser";
import { ValueType, XNode } from "./XNode";

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
   * General exception
   */
  static Exception = class extends Error {};
  /**
   * Not used at the moment
   */
  static NotFound = class extends Expression.Exception {};
  /**
   * expression part type prevent calculations, e.g. "false * 3"
   */
  static TypeError = class extends Expression.Exception {};

  /**
   * Error while parsing the expression
   */
  static SyntaxError = class extends Expression.Exception {
    constructor(readonly pc: ParserContext, text = "syntax error") {
      super(`${text} at ${pc.lastOffset}`);
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
   * Calculate the expression using provided value for variables. Note that missing variables are considered
   * having value of `null` and processed as usual.
   *
   * @param variables to use in calculation.
   */
  calculate(variables: Record<string,ValueType> = {}): ValueType {
    return this.rootNode.calculate({variables});
  }
}