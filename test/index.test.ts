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
});
