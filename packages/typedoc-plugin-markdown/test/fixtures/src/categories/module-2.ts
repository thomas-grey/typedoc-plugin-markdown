/* eslint-disable @typescript-eslint/no-namespace */
/**
 * @categoryDescription Category 1
 *
 * Description for module-2 category 1
 *
 * @categoryDescription Category 2
 *
 * Description for module-2 Category 2
 *
 * @module
 */
/**
 * @category Category 1
 */
export function someFunction() {}

/**
 * @category Category 1
 */
export class SomeClass {}

/**
 * @category Category 1
 */
export interface SomeInterface {}

/**
 * @category Category 1
 */
export namespace NamespaceCategoryOne {
  /**
   * @category NamespaceA Category 2
   */
  export interface NamespaceInterface {}
}

/**
 * @category Category 2
 */
export function someFunction2() {}

/**
 * @category Category 2
 */
export class SomeClass2 {}

/**
 * @category Category 2
 */
export interface SomeInterface2 {}

export enum SomeEnum {}

export namespace NamespaceNoCategory {
  export interface NamespaceInterface {}
}

/**
 * @category Category 3
 */
export interface SomeInterfaceTwoB {}
