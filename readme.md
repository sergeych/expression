# Simple Expression parser beta

> beta stage, ready for open test.

## Usage

~~~typescript
  // parse (sort of compile) expression
  const exp = new Expression("foo + bar*2");
  // detected variables:
  console.log(exp.variables);
  
  // calculate with goven variables:
  expect(exp.calculate({foo: 10, bar: 20 })).toEqual(50);
~~~

## Features

- regular math, brackets
- logic operations: true, false, &&, ||, !, !!, >=, >. <=, <<, !==, ===
- arithmetic comparisons
- string and boolean types. 

Several note on operators:

|op |operation|
|---|---------|
| !x  | convert x to boolean and negate, e.g. `!1 === false` |
| !!x | convert x to boolean, e.g. `!!1 === true` |
| +x | when used as unary, converts x from string to number if need |
/x + y| if x or y is string, concatenates strings, otherwise sum numbers|
| comparisons | see note below |

### Comparison operators

Equality operators `== === != !===` works for all types as in javascript.

Comparison operators `< <= >= >` works only if both operands are of the same type,
or will throw an exception on calculation time. Use `+strValue` to convert string expression to a number for comparison.

Boolean expressions can be only compared for equality, we do not impose order on them.

Boolean operators are not converted to number as for now.

We try to self-document all parts as much as possible.

## License 

MIT, see the repository.