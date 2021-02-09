import { Expression } from "../src";

it("parses constants", () => {

  // number literals and unary operations
  expect(new Expression("42").caclulate()).toEqual(42);
  expect(new Expression("42.12").caclulate()).toEqual(42.12);
  expect(new Expression("-19").caclulate()).toEqual(-19);
  expect(new Expression("-19.11").caclulate()).toEqual(-19.11);
  expect(new Expression("!!0").caclulate()).toEqual(false);
  expect(new Expression("!!1").caclulate()).toEqual(true);
  expect(new Expression("!1").caclulate()).toEqual(false);
  expect(new Expression("!0").caclulate()).toEqual(true);
  expect(new Expression("!true").caclulate()).toEqual(false);
  expect(new Expression("!false").caclulate()).toEqual(true);
});

it("parses basic operations", () => {
  // number literals and unary operations
  expect(new Expression("42 + 11").caclulate()).toEqual(53);
  expect(new Expression("42 - 11").caclulate()).toEqual(31);
  expect(new Expression("2 * 2").caclulate()).toEqual(4);
  expect(new Expression("2 * 2 + 10").caclulate()).toEqual(14);
  expect(new Expression("10 + 2 * 2").caclulate()).toEqual(14);
  expect(new Expression("10 + 2 * 2 + 10").caclulate()).toEqual(24);
  expect(new Expression("10 + 2 * 3 * 4 + 10").caclulate()).toEqual(44);
  expect(new Expression("10 - 8/2 - 1").caclulate()).toEqual(5);
});

it("parses logic operations", () => {
  expect(new Expression("10 - 8/2 - 1 == 4 + 1").caclulate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 != 4 + 1").caclulate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 == 4 + 2").caclulate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 <= 6").caclulate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 <= 5").caclulate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 <= 4").caclulate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 > 5").caclulate()).toEqual(false);
  expect(new Expression("10 - 8/2 - 1 >= 4").caclulate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 > 4").caclulate()).toEqual(true);
  expect(new Expression("10 - 8/2 - 1 > 10").caclulate()).toEqual(false);
});

it("parses brackets", () => {
  expect(new Expression("(10-2)/2").caclulate()).toEqual(4);
  expect(new Expression("(3+2)*2").caclulate()).toEqual(10);
});

it("parses variables", () => {
  const exp = new Expression("foo + bar*2");
  expect(exp.variables).toContain("foo");
  expect(exp.variables).toContain("bar");
  expect(exp.variables.length).toBe(2);
  expect(exp.caclulate({foo: 10, bar: 20 })).toEqual(50);
  expect(exp.caclulate({foo: 1, bar: 2 })).toEqual(5);
});
