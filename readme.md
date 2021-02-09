# Simple Expression parser beta

> alfa stage, please wait.

## Usage

~~~typescript
  // parse (sort of compile) expression
  const exp = new Expression("foo + bar*2");
  // detected variables:
  console.log(exp.variables);
  
  // calculate with goven variables:
  expect(exp.caclulate({foo: 10, bar: 20 })).toEqual(50);
~~~

## Ready features

- regular math and parenteses
- logic operations: true, false, &&, ||, !
- arithmetic comparisons

We try to self-document all parts as much as possible.

## Licesnse 

MIT, see the repository.