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

export type Token = TokenConstant | TokenName | TokenOperator | TokenBracket;

const digits = new Set("0123456789");
const letters = new Set("qwertyuiopasdfghjklzxcvbnm");
const operatorCharacters = new Set("-+!=<>&|*/");

export class ParserContext {
  private index: number;

  private puhsbackPositions: number[] = [];
  private lastIndex: number;

  private row = 0;
  private lastRowStart = 0;

  constructor(private readonly source: string) {
    this.index = 0;
    this.lastIndex = source.length;
  }

  get currentPosition(): number { return this.index; }

  readonly variables = new Set<string>();

  toString(): string {
    return `${this.index}/${this.lastIndex}:${this.source}`;
  }

  nextTokenOrThrow(): Token {
    const t = this.nextToken();
    if( t ) return t;
    this.syntaxError("premature lastIndex of expression");
  }

  nextToken(): Token | undefined {
    this.puhsbackPositions.push(this.index);
    this.skipws();
    const ch = this.peekChar();
    if( !ch ) return undefined;
    if( digits.has(ch) )
      return this.readNumber();
    if( operatorCharacters.has(ch))
      return this.readOperator();
    if( letters.has(ch) || ch == "_" )
      return this.readName();
    if( ch == '(' || ch == ')') {
      this.index++;
      return { type: "bracket", value: ch };
    }
    return undefined;
  }

  pushBack() {
    if( this.puhsbackPositions.length == 0 )
      throw new Error("can't pushback");
    this.index = this.puhsbackPositions.pop()!;
  }

  private readDigits(): string {
    return this.readSet(digits);
  }

  private readName(): TokenName {
    let result = ""+this.nextChar();
    while(!this.isEnd) {
      const ch = this.peekChar();
      if( !ch || !letters.has(ch) && !digits.has(ch) && ch != "_") break;
      result += ch;
      this.index++;
    }
    return {type: "name", value: result};
  }

  private readSet(setClass: Set<string>): string {
    let result = "";
    for( let ch=this.peekChar(); ch && setClass.has(ch); ) {
      result += ch;
      ch = this.source.charAt(++this.index);
    }
    return result;
  }

  private readOperator(): TokenOperator {
    return {type: "operator", value: this.readSet(operatorCharacters) };
  }

  private readNumber(): TokenConstant {
    let result = this.readDigits();
    if( this.peekChar() == ".") {
      result += this.nextChar() + this.readDigits();
      if( this.peekChar()?.toLowerCase() == "e") {
        result += this.nextChar();
        const c = this.peekChar();
        if( c == '+' || c == '-') result += this.nextChar();
        result += this.readDigits();
      }
    }
    return { type: "constant", value: +result };
  }

  private nextChar(): string | undefined {
    if( this.isEnd ) return undefined;
    return this.source.charAt(this.index++);
  }

  private peekChar(): string | undefined {
    if( this.isEnd ) return undefined;
    return this.source.charAt(this.index);
  }

  skipws(): ParserContext {
    while(this.index < this.lastIndex) {
      switch (this.source[this.index]) {
        case "\n":
          this.lastRowStart = this.index++;
          break;
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

  get isEnd(): boolean { return this.index >= this.lastIndex; }

  syntaxError(text="syntax error"): never {
    const start = this.puhsbackPositions[this.puhsbackPositions.length-1] || this.lastIndex;
    console.log(start, this.lastRowStart);
    throw new Expression.SyntaxError(this.row, start-this.lastRowStart,"syntax error");
  }
}