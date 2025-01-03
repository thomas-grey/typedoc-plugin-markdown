/**
 * @module
 */

/**
 * Comments for BasicClass
 */
export class BasicClass {
  /**
   * Comments for prop
   */
  prop!: string;
  /**
   * Comments for method
   */
  method() {
    return this.prop;
  }
}

/**
 * Comments for `DuplicateClass`
 */
export class DuplicateClass {
  /**
   * Comments for prop
   */
  prop!: string;
}

/**
 * Comments for `_DuplicateClass_`
 */
export class _DuplicateClass_ {
  /**
   * Comments for prop
   */
  prop!: string;
}

/**
 * Comments for `__DuplicateClass__`
 */
export class __DuplicateClass__ {
  /**
   * Comments for prop
   */
  prop!: string;
}

/**
 * Comments for ClassWithSimpleProps
 */
export class ClassWithSimpleProps {
  /**
   * Comments for propA
   */
  propA = 'propAValue';
  /**
   * Comments for propB
   *
   * @defaultValue 'propBDefaultValue'
   */
  propB = 'propBValue';
  /**
   * Comments for propB
   * on two lines
   *
   * @defaultValue 'propCDefaultValue'
   */
  propC!: string;
  /**
   * Comments for propE
   */
  propD!: string;
}

/**
 * Comments for ClassWithComplexProps
 */
export class ClassWithComplexProps {
  objecLiteralProp = {
    /**
     * Comments for someFunction
     */
    someFunction: (a: string) => {
      return a;
    },
    /**
     * Comments for someProp
     */
    someProp: 'someProp',
  };
}

export abstract class AbstractClass {
  /**
   * Comments for abstractProp
   */
  abstract abstractProp: string;

  /**
   * Comments for abstractMethod
   */
  abstract abstractMethod(): string;
}

/**
 * Comments for DerivedClassA
 */
export class DerivedClassA extends AbstractClass {
  abstractProp = 'abstractProp';
  derivedProp!: string;
  abstractMethod() {
    return 'abstractMethod';
  }
  derivedMethod() {
    return 'derivedMethod';
  }
}

/**
 * Comments for DerivedClassB
 */
export class DerivedClassB extends AbstractClass {
  abstractProp = 'abstractProp';
  abstractMethod() {
    return 'abstractMethod';
  }
}

const symbolConst: unique symbol = Symbol('SomeSymbol');

export class ClassWithSymbols {
  [Symbol.dispose]() {}
  public static [symbolConst]?: () => void;
}

export class DisposableClass implements Disposable {
  [Symbol.dispose]() {}
}

/**
 * Comments for ClassWithConstructorOverloads
 */
export class ClassWithConstructorOverloads {
  /**
   *
   * @param x Comments for x number
   * @param y
   */
  constructor(x: number, y: string);
  /**
   *
   * @param x Comments for x string
   */
  constructor(x: string);
  constructor(s: string);
  constructor(xs: any, y?: any) {}
}

/**
 * Comments for ClassWithTypeParameters
 *
 * @param B Comments for param B
 * @param C Comments for param C
 */
export class ClassWithTypeParameters<A, B extends string, C = boolean> {}

/**
 * Comments for ClassWithAccessors
 */
export class ClassWithAccessors {
  private privateProp!: string;
  /**
   * Comments for getter
   */
  get accessor() {
    return this.privateProp;
  }

  /**
   * Comments for setter
   * @param value Param comments
   */
  set accessor(value: string) {
    this.privateProp = value;
  }

  get noSetter() {
    return 'x';
  }

  set noGetter(x: string) {}
}

/**
 * Comments for ClassWithModifiers
 */
export abstract class ClassWithModifiers {
  /**
   * Comments for staticProp
   */
  static staticProp: string;

  /**
   * Comments for privateProp
   */
  private privateProp!: string;

  /**
   * Comments for abstractProperty
   */
  readonly readonlyProp!: string;

  /**
   * Comments for protectedProp
   */
  protected protectedProp!: string;

  /**
   * Comments for propWithDefault
   */
  publicPropWithDefault = 'propWithDefault';

  /**
   * Comment for publicMethod
   */
  publicMethod() {
    return this.privateMethod();
  }

  /**
   * Comment for privateMethod
   */
  private privateMethod() {}

  /**
   * Comment for staticMethod
   */
  static staticMethod() {}
}

export class CallbacksOptions<P = DisposableClass, A = ClassWithModifiers> {}

/**
 * Comment for ClassWithFlags
 */
export class ClassWithFlags {
  /** @experimental */
  expermintalProp!: string;
  /** @internal */
  private internalProp!: string;
  /** @experimental */
  expermintalMethod() {}
  /**
   * @internal
   */
  protected internalMethod() {}
}

export class BaseClass {}
export class ChildClassA extends BaseClass {}
export class ChildClassB extends BaseClass {}
export class GrandChildClassA extends ChildClassA {}
export class GrandChildClassB extends ChildClassA {}

export class ClassWithPropCategories {
  /**@category CatA */
  prop1: string;
  /**@category CatB */
  prop2: string;

  constructor(opts: { a: string; b: string }) {
    this.prop1 = opts.a;
    this.prop2 = opts.b;
  }

  method1(): void {}
  method2(): void {}
}

export class ClassWithoutPropCategories {
  prop1: string;
  prop2: string;

  constructor(opts: { a: string; b: string }) {
    this.prop1 = opts.a;
    this.prop2 = opts.b;
  }

  method1(): void {}
  method2(): void {}
}

export class ClassWithAccessorKeywords {
  /**
   * Accessor comments
   *
   * @example
   * ```ts
   * const x = 1;
   * ```
   */
  public accessor accessor1!: string;

  /**
   * Accessor comments
   *
   * @remarks Remark comments
   */
  public accessor accessor2!: string;

  /**
   * Accessor comments
   */
  public accessor accessor3!: string;
}
