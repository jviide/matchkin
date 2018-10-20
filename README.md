# matchkin(d)

A small non-motivating example:

```ts
class A {
  readonly kind = "a";
  something = "Hello, World!";
}
class B {
  readonly kind = "b";
  other = "G'day, mate!";
}

const match = createMatcher("kind", {
  a: (input: A) => input.something,
  b: (input: B) => input.other
});
const greeting = match(new A(), {
  a: v => "Kind A says: " + v,
  b: v => "Kind B says: " + v
});
console.log(greeting);  // Kind A says: Hello, World!
```

