import { ReflectionKind, TypeDocOptionMap } from 'typedoc';

export interface TypedocPluginMarkdownOptions extends TypeDocOptionMap {
  anchorFormat: AnchorFormat;
  baseUrl: string;
  entryDocument: string;
  enumMembersFormat: DataFormatStyle;
  flattenOutputFiles: boolean;
  groupByKinds: boolean;
  hideBreadcrumbs: boolean;
  hideInPageTOC: boolean;
  hideKindTag: boolean;
  hidePageHeader: boolean;
  hidePageTitle: boolean;
  hideHierarchy: boolean;
  indentifiersAsCodeBlocks: boolean;
  indexPageTitle: string;
  kindsWithOwnFile: string | string[];
  namedAnchors: boolean;
  numberPrefixOutput: boolean;
  propertiesFormat: DataFormatStyle;
}

export interface TemplateMapping {
  directory: string | null;
  template: any;
  isLeaf: boolean;
  kind: ReflectionKind;
}

export type Collapse = 'object' | 'function' | 'all' | 'none';

export type DataFormatStyle = 'list' | 'table';

export type AnchorFormat = 'lowercase' | 'slug' | 'none';

export type FrontmatterGlobals =
  | string
  | Record<string, string | boolean | number | null>;

export type FrontmatterNamingConvention =
  | 'camelCase'
  | 'snakeCase'
  | 'kebabCase'
  | 'pascalCase';

export interface NavigationItem {
  title?: string;
  url?: string;
  children?: NavigationItem[];
  isReadme?: boolean;
  isGroup?: boolean;
}