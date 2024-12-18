import { expectFileToEqual } from '@devtools/testing';

describe(`Utils`, () => {
  test(`should get interface with brackets`, () => {
    expectFileToEqual('utils', 'members', 'interfaces/InterfaceWithChars.md');
  });

  test(`should get class with brackets`, () => {
    expectFileToEqual('utils', 'members', 'classes/ClassWithChars.md');
  });

  test(`should get variable with brackets`, () => {
    expectFileToEqual('utils', 'members', 'variables/variableWithChars.md');
  });

  test(`should get prettified function`, () => {
    expectFileToEqual(
      'utils',
      'members',
      'functions/some_prettier_function.md',
    );
  });

  test(`should get prettified function`, () => {
    expectFileToEqual(
      'utils',
      'members',
      'type-aliases/SomePrettierTypeAlias.md',
    );
  });
});
