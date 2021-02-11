import { Expression } from "../src";

it("parses constants", () => {

  // number literals and unary operations
  expect(new Expression("42").calculate()).toEqual(42);
  expect(new Expression("42.12").calculate()).toEqual(42.12);
  expect(new Expression("-19").calculate()).toEqual(-19);
  expect(new Expression("-19.11").calculate()).toEqual(-19.11);
  expect(new Expression("!!0").calculate()).toEqual(false);
  expect(new Expression("!!1").calculate()).toEqual(true);
  expect(new Expression("!1").calculate()).toEqual(false);
  expect(new Expression("!0").calculate()).toEqual(true);
  expect(new Expression("!true").calculate()).toEqual(false);
  expect(new Expression("!false").calculate()).toEqual(true);
});

it("parses basic operations", () => {
  // number literals and unary operations
  expect(new Expression("42 + 11").calculate()).toEqual(53);
  expect(new Expression("42 - 11").calculate()).toEqual(31);
  expect(new Expression("2 * 2").calculate()).toEqual(4);
  expect(new Expression("2 * 2 + 10").calculate()).toEqual(14);
  expect(new Expression("10 + 2 * 2").calculate()).toEqual(14);
  expect(new Expression("10 + 2 * 2 + 10").calculate()).toEqual(24);
  expect(new Expression("10 + 2 * 3 * 4 + 10").calculate()).toEqual(44);
  expect(new Expression("10 - 8/2 - 1").calculate()).toEqual(5);
});

it("parses logic operations", () => {
  expect(new Expression("10 - 8/2 - 1 == 4 + 1").calculate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 != 4 + 1").calculate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 == 4 + 2").calculate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 <= 6").calculate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 <= 5").calculate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 <= 4").calculate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 > 5").calculate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 >= 4").calculate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 > 4").calculate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 > 10").calculate()).toEqual(false);
  expect(new Expression("! ! ! ! ! ! 1 === true").calculate()).toEqual(true);
  expect(new Expression("!! 1 === true").calculate()).toEqual(true);
});

it("parses brackets", () => {
  expect(new Expression("(10-2)/2").calculate()).toEqual(4);
  expect(new Expression("(3+2)*2").calculate()).toEqual(10);
});

it("parses variables", () => {
  const exp = new Expression("foo + bar*2");
  expect(exp.variables).toContain("foo");
  expect(exp.variables).toContain("bar");
  expect(exp.variables.length).toBe(2);
  expect(exp.calculate({foo: 10, bar: 20 })).toEqual(50);
  expect(exp.calculate({foo: 1, bar: 2 })).toEqual(5);

  const x= new Expression("10*some.prop");
  expect(x.variables).toContain("some.prop");
  expect(x.calculate({"some.prop":5})).toEqual(50);

});

it("has string literals", () => {
  expect(new Expression("'foo'").calculate()).toEqual("foo");
  expect(new Expression('"foo"').calculate()).toEqual("foo");
  expect(new Expression('"foo"+(40+2)').calculate()).toEqual("foo42");
  expect(new Expression('"foo"+"bar"').calculate()).toEqual("foobar");
  expect(new Expression('1+"bar"').calculate()).toEqual("1bar");
});

it("has vars:with:colon", () => {
  const x = new Expression("foo:bar * 0.15");
  expect(x.variables).toContain("foo:bar");
  expect(x.calculate({"foo:bar": 10})).toEqual(1.5);
})

function bm(text, repetitions: number, f: () => void) {
  const start = Date.now();
  let r = repetitions;
  while( r-- > 0)
    f();
  console.log(`bm/${repetitions}: ${Date.now() - start}: ${text}`)
}

it("benchmark", () => {
  const e = new Expression("foo*(7-1*3) + 4");
  const context = {foo: 10 };
  let s = 0;
  bm("constexpr calculate", 5000000,()=> {
    s += e.calculate(context) as number;
  });
});