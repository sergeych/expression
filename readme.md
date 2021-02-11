# Simple Expression parser beta

> beta stage, ready for open test.

## Usage

Include it from the [npm module uxpression](https://www.npmjs.com/package/uxpression)
e.g.

    yarn add uxpression

or using your favorite package manager. Once you have it added:

~~~typescript
  // import Expression it the way you prefer, like
  import { Expression } from "uxpression";

  // parse (sort of compile) expression
  const exp = new Expression("foo + bar*2");
  // detected variables:
  console.log(exp.variables);
  
  // calculate with given variables:
  expect(exp.calculate({foo: 10, bar: 20 })).toEqual(50);
  // recaclulation is very fast, no need to parse:
  expect(exp.calculate({foo: 10, bar: 10 })).toEqual(30);
~~~

## Features

Extremely fast calculation of once created expression. Expression constructor creates 
and optimizes expression tree to speed up calculations. Main usage paradigm is
to create instance and then call `caclulate` with necessary variables.

- regular math, brackets
- logic operations: true, false, &&, ||, !, !!, >=, >. <=, <<, !==, ===
- arithmetic comparisons
- string and boolean types. 
- constant subexpressions optimization

Several note on operators:

|op |operation|
|---|---------|
| !x  | convert x to boolean and negate, e.g. `!1 === false` |
| !!x | convert x to boolean, e.g. `!!1 === true` |
| +x | when used as unary, converts x from string to number if need |
|x + y| if x or y is string, concatenates strings, otherwise sum numbers|
| comparisons | see note below |

### Comparison operators

Equality operators `== === != !===` works for all types as in javascript.

Comparison operators `< <= >= >` works only if both operands are of the same type,
or will throw an exception on calculation time. Use `+strValue` to convert string expression to a number for comparison.

Boolean expressions can be only compared for equality, we do not impose order on them.

Boolean operators are not converted to number as for now.

## More inrormation

If for some reason it is not enough, see [online documentation](https://kb.universablockchain.com/system/static/uxpression/index.html).

## Contribution

Your welcome. The rules as everythwre in the github. Make a PR. Don't forget tests and comments.

## License 

MIT, see the repository.
