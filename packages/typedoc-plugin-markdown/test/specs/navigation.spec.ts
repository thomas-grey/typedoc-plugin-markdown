import { expectFileToEqual } from '@devtools/testing';

describe(`Navigation`, () => {
  test(`should get with and without groups and categories`, () => {
    expectFileToEqual('navigation', ['members', 'modules'], 'navigation.json');
  });

  test(`should gets Navigation Json for single entry point`, () => {
    expectFileToEqual(
      'reflections',
      ['members', 'modules'],
      'navigation.json',
      1,
    );
  });

  test(`should gets Navigation Json for multiple entry points`, () => {
    expectFileToEqual('groups', ['members', 'modules'], 'navigation.json');
  });

  test(`should get Navigation Json for packages`, () => {
    expectFileToEqual('packages', ['members', 'modules'], 'navigation.json');
  });

  test(`should gets Navigation Json for entry modules`, () => {
    expectFileToEqual('entryfiles', ['members', 'modules'], 'navigation.json');
  });

  test(`should gets Navigation Json for modules with parts`, () => {
    expectFileToEqual('modules', ['members', 'modules'], 'navigation.json');
  });

  test(`should gets Navigation Json for documents multi module`, () => {
    expectFileToEqual('documents', ['members', 'modules'], 'navigation.json');
  });

  test(`should gets Navigation Json for documents single module`, () => {
    expectFileToEqual(
      'documentsSingleModule',
      ['members', 'modules'],
      'navigation.json',
    );
  });

  test(`should gets Navigation Json for categories multi module`, () => {
    expectFileToEqual('categories', 'categories', 'navigation.json');
  });

  test(`should gets Navigation Json for categories single module`, () => {
    expectFileToEqual(
      'categoriesSingleModule',
      'categories',
      'navigation.json',
    );
  });
});
