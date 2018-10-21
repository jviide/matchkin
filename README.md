# matchkin

**matchkin** is a TypeScript library that aims to provide a form of matching that can be statically proven to be *exhaustive*. Exhaustive in this context means that all possible values get handled (as far as we don't deliberately escape the sweet embrace of the type system).

For example [this article](http://ideasintosoftware.com/exhaustive-switch-in-typescript/) outlines one way to achieve pretty much the same thing with switch statements. The switch statements can get statically checked for unexpected values, so you're protected from matching against `"hambugre"` instead of `"hamburger"`. However matchkin does offer some extras:

 * **Never forget the default block.** If the type checker sees that all possibilities aren't explicitly covered then the default fallback is required. Note that e.g. [TSLint](https://palantir.github.io/tslint/) can be configured to require default blocks in all switch statements. However...
 * **No gratuitous default blocks.** If the type system in convinced that you're handling all cases then the default fallback is forbidden.
 * **Ensure that this all can be checked statically.** Moving up one meta level. Matchers are created by calling `createMatcher(...)`. Those calls also get statically checked to make sure that the above checks can be performed for the resulting matcher.

Of course there are negative sides:

 * Some more ceremony when creating a matching function using `createMatcher`. Though hopefully that's an one-time investment.
 * The library currently supports discriminating types by [literal string types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) only.
 * Hurrah, yet another library to include to your project!

Here's an animated GIF that demonstrates the features:

![An animated GIF showcasing the features](https://user-images.githubusercontent.com/19776768/47261592-06189200-d4db-11e8-8c7d-b4c8d7efbe3e.gif)

## Installation

```sh
$ yarn add matchkin
```

## Usage

```ts
import { createMatcher } from "matchkin";
```

## License

This library is licensed under the MIT license. See [LICENSE](./LICENSE).
