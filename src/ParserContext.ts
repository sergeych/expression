import { ValueType } from "./XNode";
import { Expression } from "./Expression";

interface TokenOperator {
  type: "operator";
  value: string;
}

interface TokenConstant {
  type: "constant";
  value: ValueType;
}

interface TokenName {
  type: "name"
  value: string;
}

interface TokenBracket {
  type: "bracket"
  value: string;
}

interface TokenListBracket {
  type: "listBracket";
  value: string;
}

interface Comma {
  type: "comma";
  value: string;
}


export type Token = TokenConstant | TokenName | TokenOperator | TokenBracket | TokenListBracket | Comma;

const digits = new Set("0123456789");
const letters = new Set("qwertyuiopasdfghjklzxcvbnm");
const operatorCharacters = new Set("-+!=<>&|*/");

const infixOperations = new Set(["in", "!in"]);

export class ParserContext {
  private index: number;

  private readonly lastIndex: number;

  constructor(private readonly source: string) {
    this.index = 0;
    this.lastIndex = source.length;
  }

  get currentPosition(): number {
    return this.index;
  }

  get lastOffset(): number {
    return this.lastIndex;
  }

  readonly variables = new Set<string>();

  toString(): string {
    return `${this.index}/${this.lastIndex}:${this.source}`;
  }

  private pushbackBuffer: Token[] = [];
  private lastToken?: Token;

  nextToken(): Token | undefined {

    const push = (t: Token) => {
      this.lastToken = t;
      return t;
    }

    if (this.pushbackBuffer.length > 0) {
      this.lastToken = this.pushbackBuffer.pop();
      return this.lastToken;
    }
    this.skipws();
    const ch = this.peekChar();
    if (!ch) return undefined;
    if (digits.has(ch))
      return push(this.readNumber());
    if (operatorCharacters.has(ch))
      return push(this.readOperator());
    if (letters.has(ch) || ch == "_") {
      const name = this.readName();
      // infix name-operators
      if( infixOperations.has(name.value) )
        return push({type:"operator",value: name.value});
      return push(name);
    }
    if (ch == '(' || ch == ')') {
      this.index++;
      return push({ type: "bracket", value: ch });
    }
    if (ch == '[' || ch == ']') {
      this.index++;
      return push({ type: "listBracket", value: ch });
    }
    if (ch == '"' || ch == "'") {
      this.index++;
      return push(this.readLiteral(ch));
    }
    if( ch == ',' ) {
      this.index++;
      return push({ type: "comma", value: ch });
    }
  }

  pushBack() {
    // if( this.pushbackPositions.length == 0 )
    //   throw new Error("can't pushback");
    // this.index = this.pushbackPositions.pop()!;
    if (!this.lastToken)
      throw new Error("can't pushback");
    this.pushbackBuffer.push(this.lastToken);
    if (this.pushbackBuffer.length > 1)
      this.lastToken = this.pushbackBuffer[this.pushbackBuffer.length - 2]
    else
      this.lastToken = undefined;
  }

  private readDigits(): string {
    return this.readSet(digits);
  }

  private readName(): TokenName {
    let result = "" + this.nextChar();
    while (!this.isEnd) {
      const ch = this.peekChar();
      if (!ch || !letters.has(ch) && !digits.has(ch) && ch != "_" && ch != "." && ch != ":") break;
      result += ch;
      this.index++;
    }
    return { type: "name", value: result };
  }

  /**
   * Skip next characters if they are equal to the pattern, e.g. advance current position to the character
   * next to the pattern. If the pattern is not fully matched, does not change position.
   * @param str pattern to expect
   * @return true if the pattern was found and current position was advanced.
   * @private
   */
  private readIfEqual(str: string): boolean {
    const savedPosition = this.index;
    for( const x of str) {
      if( x == this.peekChar() ) this.index++;
      else {
        this.index = savedPosition;
        return false;
      }
    }
    return true;
  }

  private readLiteral(delimiter: string): TokenConstant {
    let result = "";
    while (!this.isEnd) {
      const ch = this.source[this.index++];
      if (ch == delimiter)
        break;
      result += ch;
    }
    return { type: "constant", value: result };
  }

  private readSet(setClass: Set<string>): string {
    let result = "";
    for (let ch = this.peekChar(); ch && setClass.has(ch);) {
      result += ch;
      ch = this.source.charAt(++this.index);
    }
    return result;
  }

  private readOperator(): TokenOperator {
    const op = this.readSet(operatorCharacters);
    // special care abount !infix operators
    if( op == "!") {
      // sp far only "!in"
      if( this.readIfEqual("in"))
        return { type: "operator", value: "!in"};
    }
    return { type: "operator", value: op };
  }

  private readNumber(): TokenConstant {
    let result = this.readDigits();
    if (this.peekChar() == ".") {
      result += this.nextChar() + this.readDigits();
      if (this.peekChar()?.toLowerCase() == "e") {
        result += this.nextChar();
        const c = this.peekChar();
        if (c == '+' || c == '-') result += this.nextChar();
        result += this.readDigits();
      }
    }
    return { type: "constant", value: +result };
  }

  private nextChar(): string | undefined {
    if (this.isEnd) return undefined;
    return this.source.charAt(this.index++);
  }

  private peekChar(): string | undefined {
    if (this.isEnd) return undefined;
    return this.source.charAt(this.index);
  }

  skipws(): ParserContext {
    while (this.index < this.lastIndex) {
      switch (this.source[this.index]) {
        case "\n":
        case " ":
        case "\t":
          this.index++;
          break;
        default:
          return this;
      }
    }
    return this;
  }

  get isEnd(): boolean {
    return this.index >= this.lastIndex;
  }

  syntaxError(text = "syntax error"): never {
    throw new Expression.SyntaxError(this, text);
  }
}