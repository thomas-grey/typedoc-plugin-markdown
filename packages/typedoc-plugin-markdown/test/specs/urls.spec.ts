import { expectUrlsToEqual } from '@devtools/testing';
describe(`Urls`, () => {
  test(`should gets Urls for multiple entry points`, () => {
    expectUrlsToEqual('groups', ['members', 'modules']);
  });

  test(`should gets Urls for single entry points`, () => {
    expectUrlsToEqual('reflections', ['members', 'modules']);
  });

  test(`should gets Urls for packages entry points`, () => {
    expectUrlsToEqual('packages', ['members', 'modules']);
  });

  test(`should gets Urls for single package entry points`, () => {
    expectUrlsToEqual('package', ['members', 'modules']);
  });

  test(`should gets Urls for entry module`, () => {
    expectUrlsToEqual('entryfiles', ['members', 'modules']);
  });

  test(`should gets Urls for readme options`, () => {
    expectUrlsToEqual('readme', ['members', 'modules']);
  });

  test(`should gets Urls for modules parts`, () => {
    expectUrlsToEqual('modules', ['members', 'modules']);
  });

  test(`should gets Urls for documents multi modules`, () => {
    expectUrlsToEqual('documents', ['members', 'modules']);
  });

  test(`should gets for categories with multi modules`, () => {
    expectUrlsToEqual('categories', ['categories']);
  });

  test(`should gets for categories with single module`, () => {
    expectUrlsToEqual('categoriesSingleModule', ['categories']);
  });

  test(`should gets Urls for documents single module`, () => {
    expectUrlsToEqual('documentsSingleModule', ['members', 'modules']);
  });

  test(`should gets Urls with media assets`, () => {
    expectUrlsToEqual('comments', ['members']);
  });
});
