import { Expression } from "./Expression";

/**
 * Type of values supported by Expression parser/calculator.
 */
export type ValueItemType = number | string | boolean | null;
export type ValueType = ValueItemType | Array<ValueType>

export interface Context {
  variables: Record<string,ValueType>;
}

export interface XNode {
  isConst: boolean;
  calculate(context: Context): ValueType;
}

export class XVariable implements XNode {

  isConst = false;

  constructor(public name: string) {
  }

  calculate(context: Context): ValueType {
    return context.variables[this.name] ?? null;
  }
}

export class XList implements XNode {
  isConst = false;

  constructor(readonly items: XNode[]) {
    this.isConst = !items.find(x => !x.isConst);
  }

  calculate(context: Context): ValueType {
    return this.items.map(x => x.calculate(context));
  }
}

export class XConstant implements XNode {
  isConst = true;

  constructor(public readonly value: ValueType) {
  }

  calculate(context: Context): ValueType {
    return this.value;
  }
}

function n(value: ValueType): number {
  switch(typeof value) {
    case "number":
      return value;
    case "string":
      return +value;
  }
  throw new Expression.TypeError(`cant convert to number: '${value}'`)
}

function smartAdd(l: ValueType,r: ValueType) {
  if( typeof(l) === "string" || typeof(r) === "string") {
    return `${l}${r}`;
  }
  return n(l) + n(r);
}

function b(value: ValueType): boolean {
  switch (typeof value) {
    case "boolean": return value;
    case "number": return value != 0;
  }
  throw new Expression.TypeError(`cant convert to boolean: '${value}'`)
}

function smartEquals(l: ValueType,r: ValueType): boolean {
  if( l instanceof Array && r instanceof Array) {
    if( l.length != r.length ) return false;
    for( let i=0; i<l.length; i++ ) {
      if( !smartEquals(l[i], r[i]) ) return false;
    }
    return true;
  }
  if( l instanceof Array || r instanceof Array)
    throw new Expression.Exception("can't check equality of list and value, use 'in' or '!in'");
  return l == r;
}

function checkInList(l: ValueType,r: ValueType): boolean {
  if( l instanceof Array ) {
    for( const x of l) if( !checkInList(x, r)) return false;
    return true;
  }
  if( r instanceof Array) {
    for (const x of r)
      if (smartEquals(l, x)) return true;
    return false;
  }
  else
    throw new Expression.Exception("operator in requires list as the right operand");
}


export class XBinaryOperation implements XNode {

  get isConst(): boolean { return this.left.isConst && this.right.isConst; }

  constructor(readonly operation: string,readonly left: XNode,readonly right: XNode) {
  }

  static validOperations: Set<string> = new Set([
    "+", "-", "*", "/", "&&", "||", "===", "==", "!=", "!==", ">", "<", "<=", ">="
  ])

  calculate(context: Context): ValueType {
    const l = this.left.calculate(context);
    const r = this.right.calculate(context);
    switch (this.operation) {
      case "+": return smartAdd(l,r);
      case "-": return n(l) - n(r);
      case "*": return n(l) * n(r);
      case "/": return n(l) / n(r);
      case "&&": return b(l) && b(r);
      case "||": return b(l) || b(r);
      case "===": return l === r;
      case "==": return smartEquals(l,r);
      case "!=": return !smartEquals(l,r);
      case "!==": return l !== r;
      case "<": return compare(l,r) < 0;
      case ">": return compare(l,r) > 0;
      case ">=": return compare(l,r) >= 0;
      case "<=": return compare(l,r) <= 0;
      case "in": return checkInList(l,r);
      case "!in": return !checkInList(l,r);
    }
    throw new Expression.Exception("unsupported operation: "+this.operation);
  }
}

/**
 * Compare only comparable items, e.g. ordered values. _Can't compare values for which does not exist order but exists
 * equity, this is an error_.
 *
 * @param a
 * @param b
 * @throws Expression.Exception if values are incomparable.
 */
function compare(a: ValueType,b: ValueType): number {
  if( typeof(a) == 'string' && typeof(b) == 'string') return a.localeCompare(b);
  if( typeof(a) == 'number' && typeof(b) == 'number') {
    if( a < b ) return  -1;
    if( a > b ) return +1;
    return 0;
  }
  throw new Expression.Exception(`Impossible to compare oder ${a} <=> ${b}`);
}


export class XUnaryOperation implements XNode {
  constructor(readonly operator: string,readonly operand: XNode) {
  }

  get isConst(): boolean { return this.operand.isConst; }

  calculate(context: Context): ValueType {
    const x = this.operand.calculate(context);
    switch (this.operator) {
      case "+": return n(x);
      case "-": return -n(x);
      case "!": return !b(x);
      case "!!": return b(x);
    }
    throw new Expression.Exception("unsupported unary operation: "+this.operator);
  }
}