import { DocsConfig, SRC_PATH } from '@devtools/helpers';
import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';
import { DeclarationOption, ParameterType } from 'typedoc';

/**
 * Creates models for plugin options
 */

export async function generateOptionsModels(docsConfig: DocsConfig) {
  const optionsConfig = await import(docsConfig.declarationsPath as string);

  const sortedOptionsConfig = Object.fromEntries(
    Object.entries(optionsConfig).sort((a, b) => a[0].localeCompare(b[0])),
  );

  await writeTypeDocDeclarations(docsConfig, sortedOptionsConfig);
  await writeOptionsTypes(docsConfig, sortedOptionsConfig);
}

async function writeTypeDocDeclarations(
  docsConfig: DocsConfig,
  sortedOptionsConfig: any,
) {
  const typedocDeclarationsFile = path.join(SRC_PATH, 'defs', 'typedoc.d.ts');

  const manuallyValidatedOptions = Object.entries(sortedOptionsConfig)
    .filter(
      ([name, option]) =>
        (option as any).type === ParameterType.Mixed &&
        (option as any).defaultValue,
    )
    .map(([name, option]) => capitalize(name));

  const out: string[] = [];

  out.push(`// THIS FILE IS AUTO GENERATED FROM THE OPTIONS CONFIG. DO NOT EDIT DIRECTLY.
import { ManuallyValidatedOption } from 'typedoc'`);

  if (manuallyValidatedOptions.length) {
    manuallyValidatedOptions.forEach((option: any) => {
      out.push(`import { ${option} } from '../options/option-types';`);
    });
  }

  out.push(`declare module 'typedoc' {`);
  out.push(`export interface TypeDocOptionMap {
    ${(Object.entries(sortedOptionsConfig) as any)
      .map(([name, option]) => `${name}: ${getType(name, option)};`)
      .join('\n')}
  }`);

  if (docsConfig.translatablePath) {
    const { translatable } = await import(docsConfig.translatablePath);
    out.push(`
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Internationalization {
    export interface TranslatableStrings ${getTranslations(translatable)}
  }`);
  }
  out.push(`}`);
  const formatted = await prettier.format(out.join('\n'), {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });

  fs.writeFileSync(typedocDeclarationsFile, formatted);
}

async function writeOptionsTypes(
  docsConfig: DocsConfig,
  sortedOptionsConfig: any,
) {
  const mixedTypes = (Object.entries(sortedOptionsConfig) as any).filter(
    ([name, option]) =>
      option.type === ParameterType.Mixed && option.defaultValue,
  );

  const optionsOutput = `
  // THIS FILE IS AUTO GENERATED FROM THE OPTIONS CONFIG. DO NOT EDIT DIRECTLY.

  /**
   * Describes the options declared by the plugin.
   *
   * @category Options
   */
  export interface PluginOptions {
    ${(Object.entries(sortedOptionsConfig) as any)
      .map(
        ([name, option]) => `
/**
 * ${option.help}
 */
${name}: ${getType(name, option, true)};`,
      )
      .join('\n')}
  }

  ${mixedTypes
    ?.map(([name, option]) => {
      return `
  /**
   * ${getComments(name)}
   *
   * @category Options
   */
  export interface ${capitalize(name)} {
      ${Object.entries(option.defaultValue as any)
        .map(
          ([key, value]) =>
            `'${key}'${value === undefined ? '?' : ''}: ${getValueType(value)}`,
        )
        .join(';')}
  }
    `;
    })
    .join('\n')}
  `;

  const optionsModelFile = path.join(
    path.dirname(docsConfig.declarationsPath as string),
    'option-types.ts',
  );

  const formatted = await prettier.format(optionsOutput, {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });

  fs.writeFileSync(optionsModelFile, formatted);
}

function getTranslations(inputObject: { [key: string]: string }) {
  const output: { [key: string]: string[] } = {};
  for (const [key, value] of Object.entries(inputObject)) {
    const matches = value.match(/{\d+}/g) || [];
    output[key] = matches.map(() => 'string');
  }
  return JSON.stringify(output).replace(/"/g, '');
}

function getComments(name: string) {
  if (name === 'textContentMappings') {
    return 'Describes the keys available to replace static text.';
  }
  return '';
}

function getValueType(value: any) {
  if (value === true || value === false) {
    return 'boolean';
  }
  if (typeof value === 'number') {
    return 'number';
  }
  if (Array.isArray(value)) {
    return 'string[]';
  }
  return 'string';
}

function getType(
  name: string,
  option: Partial<DeclarationOption>,
  isInterface = false,
) {
  if (option.type === ParameterType.Array && option.defaultValue) {
    return `(${option.defaultValue
      .toString()
      .split(',')
      .map((item) => `"${item}"`)
      .join(' | ')})[]`;
  }

  if (option.type === ParameterType.Boolean) {
    return 'boolean';
  }
  if (
    option.type === ParameterType.String ||
    option.type === ParameterType.Path
  ) {
    return 'string';
  }
  if (option.type === ParameterType.Array) {
    return 'any[]';
  }
  if (option.type === ParameterType.Flags && option.defaults) {
    return `{${Object.keys(option.defaults)
      .map((key) => `'${key}': boolean`)
      .join(';')}}`;
  }
  if (option.type === ParameterType.Mixed && option.defaultValue) {
    const useAny = name === 'textContentMappings';
    return isInterface
      ? useAny
        ? `Partial<any>`
        : capitalize(name)
      : useAny
        ? `ManuallyValidatedOption<Partial<${capitalize(name)}>>`
        : `ManuallyValidatedOption<${capitalize(name)}>`;
  }

  if (option.type === ParameterType.Map && option.map) {
    return `${Object.values(option.map)
      .map((value) => `"${value}"`)
      .join(' | ')}`;
  }
  return 'any';
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
