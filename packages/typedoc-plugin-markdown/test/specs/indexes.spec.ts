import { expectFileToEqual } from '@devtools/testing';

describe(`Indexes`, () => {
  describe(`Members`, () => {
    test(`should compile reflection "indexes"`, () => {
      expectFileToEqual('reflections', 'members', 'globals.md', 1);
    });

    test(`should compile project index for "members"`, () => {
      expectFileToEqual('modules', 'members', 'modules.md', 1);
    });
  });

  describe(`Modules`, () => {
    test(`should compile project index for "modules"`, () => {
      expectFileToEqual('modules', 'modules', 'modules.md', 1);
    });
  });

  describe(`Categories`, () => {
    test(`should compile project index for categories`, () => {
      expectFileToEqual('categories', 'categories', 'README.md');
    });

    test(`should compile project index for categories single module`, () => {
      expectFileToEqual('categoriesSingleModule', 'categories', 'README.md');
    });

    test(`should compile module index for categories`, () => {
      expectFileToEqual('categories', 'categories', 'module-1/README.md');
    });

    test(`should compile module index for categories single module`, () => {
      expectFileToEqual('categoriesSingleModule', 'categories', 'README.md');
    });
  });
});
