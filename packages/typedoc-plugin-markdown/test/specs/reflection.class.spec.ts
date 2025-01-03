import { expectFileToEqual } from '@devtools/testing';

describe(`Class Reflection`, () => {
  test(`should compile basic class`, () => {
    expectFileToEqual('reflections', 'members', 'classes/BasicClass.md');
  });

  test(`should compile class with simple props`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithSimpleProps.md',
    );
  });

  test(`should compile class with complex props`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithComplexProps.md',
    );
  });

  test(`should compile abstract class`, () => {
    expectFileToEqual('reflections', 'members', 'classes/AbstractClass.md');
  });

  test(`should compile derived class`, () => {
    expectFileToEqual('reflections', 'members', 'classes/DerivedClassA.md');
  });

  test(`should compile class with constructor overloads`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithConstructorOverloads.md',
    );
  });

  test(`should compile class with type parameters`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithTypeParameters.md',
    );
  });

  test(`should compile class with accessors`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithAccessors.md',
    );
  });

  test(`should compile class with modifiers`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithModifiers.md',
    );
  });

  test(`should compile class with flags`, () => {
    expectFileToEqual('reflections', 'members', 'classes/ClassWithFlags.md');
  });

  test(`should compile disposable class`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/DisposableClass.md',
      1,
    );
  });

  test(`should compile class with symbols`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithSymbols.md',
      1,
    );
  });

  test(`should compile hierarchy for BaseClass`, () => {
    expectFileToEqual('reflections', 'members', 'classes/BaseClass.md', 1);
  });

  test(`should compile hierarchy for ChildClassA`, () => {
    expectFileToEqual('reflections', 'members', 'classes/ChildClassA.md', 1);
  });

  test(`should compile hierarchy for GrandChildClassA`, () => {
    expectFileToEqual('reflections', 'members', 'classes/GrandChildClassA.md');
  });

  test(`should compile class with prop categories`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithPropCategories.md',
    );
  });

  test(`should compile class without prop categories`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithoutPropCategories.md',
    );
  });

  test(`should compile class with accessor keywords`, () => {
    expectFileToEqual(
      'reflections',
      'members',
      'classes/ClassWithAccessorKeywords.md',
    );
  });
});
