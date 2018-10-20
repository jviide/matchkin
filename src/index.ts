const hasOwnProperty = Object.prototype.hasOwnProperty;

function preserve(obj: { [K: string]: any }) {
  const result = Object.create(null);
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return Object.freeze(result);
}

// A roundabout way to ensure that T is a single string literal.
// For example type AssertSingleLiteralString<"hello"> == unknown,
// while AssertSingleLiteralString<"hello" | "world"> == never.
type AssertSingleLiteralString<T> = T extends string
  ? (string extends T
      ? never
      : (1 extends { [K in T]: T extends K ? 0 : 1 }[T] ? never : unknown))
  : never;

// Ensure that every key in KindDict corresponds to its input type.
type AssertConsistentKinds<KindKey, KindDict> = {
  [K in keyof KindDict]: KindDict[K] extends ((v: infer V) => any)
    ? (KindKey extends keyof V
        ? (V[KindKey] extends K ? unknown : never)
        : never)
    : never
};

export function createMatcher<
  KindKey extends string,
  KindDict extends { [K: string]: (v: any) => any }
>(
  kindKey: KindKey & AssertSingleLiteralString<KindKey>,
  kindDict: KindDict & AssertConsistentKinds<KindKey, KindDict>
) {
  const kinds = preserve(kindDict);

  // An union of potential kind literals
  type Kinds = keyof KindDict;

  // The type of the argument "matched"
  type InputMatched = {
    [K in Kinds]: KindDict[K] extends ((v: infer V) => any) ? V : never
  }[Kinds];

  // The type of the argument "options"
  type InputOptions = {
    [K in Kinds]: KindDict[K] extends ((v: infer V) => infer O)
      ? ((v: O) => any)
      : never
  };

  // Assert that Opts is not an exhaustive list of all known kinds.
  // Note: Opts may contain unknown kinds, but that's ok, because
  // AssertNoExtras is used to deal with that.
  type AssertNotExhaustive<Opts> = Kinds extends keyof Opts ? never : unknown;

  // Assert that Opts contains only known kinds.
  type AssertNoExtras<Opts> = {
    [K in keyof Opts]: K extends Kinds ? unknown : never
  };

  // An union of all output types of the argument "options".
  type Output<Opts> = {
    [K in keyof Opts]: Opts[K] extends (...args: any[]) => infer O ? O : never
  }[keyof Opts];

  function match<Options extends InputOptions>(
    matched: InputMatched,
    options: Options & AssertNoExtras<Options>
  ): Output<Options>;
  function match<
    Options extends Partial<InputOptions>,
    Default extends () => any
  >(
    matched: InputMatched,
    options: Options & AssertNoExtras<Options>,
    defaultTo: Default & AssertNotExhaustive<Options>
  ): Output<Options> | (Default extends () => infer O ? O : never);
  function match(matched: any, options: any, defaultTo?: any) {
    const kind = matched[kindKey];
    const handler = hasOwnProperty.call(options, kind) ? options[kind] : null;
    if (handler) {
      return handler(kinds[kind](matched));
    }
    if (defaultTo) {
      return defaultTo();
    }
    throw new TypeError("unknown kind");
  }
  return match;
}
