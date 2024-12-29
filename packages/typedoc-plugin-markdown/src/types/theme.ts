import { MarkdownPageEvent } from '@plugin/events/index.js';
import { OutputFileStrategy } from '@plugin/options/maps.js';
import { Options, ReflectionKind } from 'typedoc';

/**
 * The model used to define the package metadata when in packages mode.
 *
 */
export interface PackageMetaData {
  description: string;
  options: Options;
}

/**
 * The model used to define the URL mapping structure.
 *
 */
export interface UrlMapping</** @ignore */ Model> {
  url: string;
  model: Model;
  group?: string;
  template: (data: MarkdownPageEvent<Model>) => string;
}

/**
 * The model used to define the navigation structure.
 *
 */
export interface NavigationItem {
  title: string;
  path?: string | null;
  kind?: ReflectionKind;
  isDeprecated?: boolean;
  children?: NavigationItem[];
}

/**
 * Defines how reflections are mapped to urls.
 */
export interface TemplateMapping {
  directory: string | null;
  template: any;
  kind: ReflectionKind;
}

/**
 * Used internally when building the URL mapping.
 */
export interface UrlOption {
  parentUrl?: string;
  directory?: string | null;
  forceDirectory?: boolean;
  outputFileStrategy?: OutputFileStrategy;
  entryModule?: string;
  entryFileName?: string;
  group?: string;
  category?: string;
}

/**
 * Defines the template type to use for rendering.
 */
export type RenderTemplate<T> = (data: T) => string;
