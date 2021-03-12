# Simple Expression parser

the simple and fast optimizing expression parser provides absolutely safe and
effective way to incorporate runtime formulae to you program. The expressions
are parased into calculation trees with constant folding, allowing fast caluclation
with a given set of variable values without re-parsing it.

## Features

Extremely fast calculation of once created expression. Expression constructor creates
and optimizes expression tree to speed up calculations. Main usage paradigm is
to create an instance and then call `caclulate` with necessary variables.

- regular math, brackets
- logic operations: true, false, &&, ||, !, !!, >=, >, <=, <<, !==, ===
- arithmetic comparisons
- string and boolean types.
- constant subexpressions optimization
- lists, list equality and inclusion

Several note on operators:

|op |operation|
|---|---------|
| !x  | convert x to boolean and negate, e.g. `!1 === false` |
| !!x | convert x to boolean, e.g. `!!1 === true` |
| +x | when used as unary, converts x from string to number if need |
|x + y| if x or y is string, concatenates strings, otherwise sum numbers|
| comparisons | see note below |
| i in list | `i` is in the `list`, see below |
| i !in list | `i` is not in the `list`, same as `!(i in list)` |


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

## Expression syntax and semantic notes

### Comparison operators

Equality operators `== === != !===` works for all types as in javascript, except for lists.

Operations '==' and '!=' if any operand is a list, requires that other operand be  list too, 
and check that lists are per-element equals. Nested lists are allowed and checked as 
expected. To check _inclusion_ instead use operators 'x in list' or 'x !in list'.

Comparison operators `< <= >= >` works only if both operands are of the same type,
or will throw an exception on calculation time. Use `+strValue` to convert string expression to a number for comparison.

Boolean expressions can be only compared for equality, we do not impose order on them.

Boolean operators are not converted to number as for now.

### Using lists

List type is just an allowed data type, that can be used in vars (use javascript Array!) or in expression using `[1,2,'foo']` notation. List item is just another expression, anything, including nested lists. Lists can therefore contain variable based expressions too.

#### Comparing lists

Allowed operators for list arguments are `==` and `!=`.

Lists comparison works as deep equality, e.g. 2 lists are equal if and only if they have exact same in the terms of regular comparison `i1 == i2`. It will apply to nested lists too.

See example from the tests:
```typescript
expect(new Expression("[1,2,[1,3]] == [1,2,[1,3]]").calculate()).toBeTruthy();
expect(new Expression("[1,2,[1,3]] == [1,2,x]").calculate({x: [1,3]})).toBeTruthy();

```

#### Concatenating lists

It is possible to concatenate operands ib _both_ are lists using plus operator:

```typescript
expect(new Expression("([1,2,3] + [3,2, 'foo']) == [1,2,3,3,2,'foo']").calculate())
  .toBeTruthy()
```

You can append or prepend a single element making a list from it: `[1] + [2,3]`.

#### Check item is included in the list

There are two infix operators to check inclusion of an item in a list: `x in list` and `x !in list`.
Not if the `x` itself is a list, it checks that _all_ the elements of x are included in the list.

```typescript
expect(new Expression("['foo', 1] in [1,5,'foo']").calculate()).toBeTruthy();
expect(new Expression("['foo', 2] !in [1,5,'foo']").calculate()).toBeTruthy();
expect(new Expression("['foo', 2] in [1,5,'foo']").calculate()).toBeFalsy();
expect(new Expression("['foo', 1] !in [1,5,'foo']").calculate()).toBeFalsy();
```

## More information

If for some reason it is not enough, see [online documentation](https://kb.universablockchain.com/system/static/uxpression/index.html).

## Contribution

You're welcome. The rules as everywhere in the github. Make a PR. Don't forget tests and comments.

## License 

MIT, see the repository.
