# matchkin [![CircleCI](https://circleci.com/gh/jviide/matchkin.svg?style=shield)](https://circleci.com/gh/jviide/matchkin)

**matchkin** is a TypeScript library for creating value matchers that can be statically proven to be _exhaustive_. Exhaustive in this context means that all possible values get handled (as long as we don't deliberately escape the sweet embrace of the type system).

For example [this article](http://ideasintosoftware.com/exhaustive-switch-in-typescript/) outlines a good way to achieve pretty much the same thing with switch statements. The switch statements can get statically checked for unexpected values, so you're protected from matching against `"hambugre"` instead of `"hamburger"`. However matchkin does offer some extra niceties:

- **Never forget the default block.** If the type checker sees that all possibilities aren't explicitly covered then the default fallback is required. Note that e.g. [TSLint](https://palantir.github.io/tslint/) can be configured to require default blocks in all switch statements. However...
- **No gratuitous default blocks.** If the type system in convinced that you're handling all cases then the default fallback is forbidden.
- **Ensure that this all can be checked statically.** Moving up one meta level. Matchers are created by calling `createMatcher(...)`. Those calls also get statically checked to make sure that the above checks can be performed for the resulting matcher.

Of course for these pros there are cons:

- Some more ceremony when creating a matching function using `createMatcher`. Though hopefully that's an one-time investment.
- The library currently supports discriminating types by [literal string types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) only.
- Hurrah, yet another library to include to your project!

Here's an animated GIF that demonstrates the features:

![An animated GIF showcasing the features](https://user-images.githubusercontent.com/19776768/47289274-943b6800-d602-11e8-92a0-344f6d8e0d36.gif)

## Installation

```sh
$ yarn add matchkin
```

## Usage

First import the function `createMatcher`.

```ts
import { createMatcher } from "matchkin";
```

Assume we have these two types:

```ts
class Cat {
  readonly species = "cat";
}
class Dog {
  readonly species = "dog";
}
```

To create a matcher we can do this:

```ts
const match = createMatcher("species", {
  cat: (c: Cat) => "kitty",
  dog: (d: Dog) => "doggy"
});
```

Here the value `"species"` is the name of the property that `match` can use to discriminate between values of type `Cat | Dog`. The type of this argument has to be a single string literal. Luckily for us its type is `"species"` as well.

The second argument is an object, its properties listing all the possible species `match` must handle. The property values are functions that take one argument: a matched instance. Their types have to be consistent with the corresponding property name - for example `dog: (c: Cat) => c` is an error, because the `"species"` property of `Cat`s is `"cat"`, not `"dog"`.

In the end `createMatcher` returns a function we here call `match`, which we can use in two ways. First we can explicitly list all possibilities:

```ts
const pet: Cat | Dog = ...

// Returns either "Bad kitty" or "Good doggy"
match(pet, {
  cat: name => `Bad ${name}`,
  dog: name => `Good ${name}`
});
```

Or we can list just some of the possibilities and provide a fallback for the non-listed ones:

```ts
// Returns either "Good doggy" or "Some non-dog"
match(
  pet,
  {
    dog: name => `Good ${name}`
  },
  () => "Some non-dog"
);
```

Either all cases must be explicitly handled _or_ there has to be a default fallback (but not both at the same time). Also extra cases, such as `pony: name => ...`, are not allowed.

## License

This library is licensed under the MIT license. See [LICENSE](./LICENSE).
