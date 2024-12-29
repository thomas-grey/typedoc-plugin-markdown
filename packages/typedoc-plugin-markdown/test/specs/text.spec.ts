import { expectFileToEqual } from '@devtools/testing';

describe(`Text`, () => {
  test(`should get translations for index page`, () => {
    expectFileToEqual('text', 'members', 'README.md');
  });

  test(`should get translations for module page`, () => {
    expectFileToEqual('text', 'members', ['module-1/README.md']);
  });

  test(`should get translations for member page`, () => {
    expectFileToEqual(
      'text',
      'members',
      'module-1/interfaces/SomeInterface.md',
    );
  });

  test(`should get translations for modules page`, () => {
    expectFileToEqual('text', 'modules', ['module-2.md']);
  });

  test(`should get translations for sidebar`, () => {
    expectFileToEqual('text', 'members', ['navigation.json']);
  });
});
