const hasOwnProperty = Object.prototype.hasOwnProperty;

function preserve(obj: { [K: string]: unknown }) {
  const result = Object.create(null);
  Object.keys(obj).forEach(key => {
    result[key] = obj[key];
  });
  Object.getOwnPropertySymbols(obj).forEach(key => {
    result[key] = obj[key as any];
  });
  return Object.freeze(result);
}

type IndexType = keyof any;

// A roundabout way to ensure that T is a single literal that is
// either also string | number | symbol.
// For example type AssertSingleLiteralIndex<"hello"> == unknown,
// while AssertSingleLiteralIndex<1 | 2> == never.
type AssertSingleLiteralIndex<T extends IndexType, U = T> = {
  [K in T]: Exclude<U, K>
}[T] extends never
  ? unknown
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
  KindKey extends IndexType,
  KindDict extends { [K: string]: (v: any) => any }
>(
  kindKey: KindKey & AssertSingleLiteralIndex<KindKey>,
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
    if (hasOwnProperty.call(options, kind)) {
      const handler = options[kind];
      return handler(kinds[kind](matched));
    }
    if (defaultTo) {
      return defaultTo();
    }
    throw new TypeError("unknown kind");
  }
  return match;
}
