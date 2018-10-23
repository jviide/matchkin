import { createMatcher } from "../src/index";
import { expect } from "chai";

class A {
  readonly kind = "a";
  valueA = 1;
}

class B {
  readonly kind = "b";
  valueB = 2;
}

describe("createMatcher", () => {
  const match = createMatcher("kind", {
    a: (m: A) => m.valueA,
    b: (m: B) => m.valueB
  });

  it("matches when given handlers for all possible kinds", () => {
    const result = match(new A(), {
      a: value => value,
      b: value => value
    });
    expect(result).to.equal(1);
  });

  it("matches when given some handlers and a default fallback", () => {
    const result = match(
      new A(),
      {
        b: value => value
      },
      () => "fallback"
    );
    expect(result).to.equal("fallback");
  });

  it("accepts strings as kind keys", () => {
    const match = createMatcher("kind", {
      a: (a: { kind: "a" }) => "A",
      b: (b: { kind: "b" }) => "B"
    });
    const result = match({ kind: "a" }, { a: a => a, b: b => b });
    expect(result).to.equal("A");
  });
  it("accepts numbers as kind keys", () => {
    const match = createMatcher(0, {
      a: (a: ["a"]) => "A",
      b: (b: ["b"]) => "B"
    });
    const result = match(["a"], { a: a => a, b: b => b });
    expect(result).to.equal("A");
  });
  it("accepts symbols as kind keys", () => {
    const kind = Symbol();

    const match = createMatcher(kind, {
      a: (a: { [kind]: "a" }) => "A",
      b: (b: { [kind]: "b" }) => "B"
    });
    const result = match({ [kind]: "a" }, { a: a => a, b: b => b });
    expect(result).to.equal("A");
  });

  it("accepts strings as kind values", () => {
    const match = createMatcher("kind", {
      a: (a: { kind: "a" }) => "A",
      b: (b: { kind: "b" }) => "B"
    });
    const result = match({ kind: "a" }, { a: a => a, b: b => b });
    expect(result).to.equal("A");
  });
  it("accepts numbers as kind values", () => {
    const match = createMatcher("kind", {
      0: (a: { kind: 0 }) => "A",
      1: (b: { kind: 1 }) => "B"
    });
    const result = match({ kind: 0 }, { 0: a => a, 1: b => b });
    expect(result).to.equal("A");
  });
  it("accepts symbols as kind values", () => {
    const A = Symbol();
    const B = Symbol();
    const match = createMatcher("kind", {
      [A]: (a: { kind: typeof A }) => "A",
      [B]: (b: { kind: typeof B }) => "B"
    });
    const result = match({ kind: A }, { [A]: a => a, [B]: b => b });
    expect(result).to.equal("A");
  });
});
