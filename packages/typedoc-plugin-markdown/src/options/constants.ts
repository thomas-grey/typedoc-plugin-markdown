/**
 * Contains constant default values used in options.
 *
 * @module
 */

import { ReflectionKind } from 'typedoc';

/**
 * Default values for `membersWithOwnFile` option.
 */
export const ALLOWED_OWN_FILE_MEMBERS = [
  ReflectionKind[ReflectionKind.Enum],
  ReflectionKind[ReflectionKind.Variable],
  ReflectionKind[ReflectionKind.Function],
  ReflectionKind[ReflectionKind.Class],
  ReflectionKind[ReflectionKind.Interface],
  ReflectionKind[ReflectionKind.TypeAlias],
];

/**
 * Default values for `textContentMappings` option.
 */
export const TEXT_CONTENT_MAPPINGS = {
  'header.title': '{projectName} {version}',
  'breadcrumbs.home': '{projectName} {version}',
  'title.indexPage': '{projectName} {version}',
  'title.memberPage': '{kind}: {name}',
  'title.modulePage': '{name}',
};

export const DEFAULT_PAGE_TITLES = {
  index: '{projectName} {version}',
  category: '{name}',
  member: '{kind}: {name}',
  module: '{name}',
};
